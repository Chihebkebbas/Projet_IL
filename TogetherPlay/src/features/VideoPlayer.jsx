import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VideoPlayer.module.css';
import { usePlaylist } from "../context/HomePlaylistContext.jsx";
import YouTube from 'react-youtube';
import socket from "../services/socket.js";
import VideoMarkers from './VideoMarkers.jsx';
import { getPopularVideos } from "../services/youtube.js";

const DEFAULT_VIDEO = {
    id: 'default-welcome',
    videoId: 'rfscVS0vtbw',
    title: 'Vidéo de démarrage',
    thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg'
};

const SEEK_THRESHOLD_S = 1.0;          // re-seek only if drift exceeds this
const SEEK_DETECT_THRESHOLD_S = 1.5;   // poll-detected jumps > this are seeks
const DRIFT_CHECK_INTERVAL_MS = 2500;
const SEEK_POLL_INTERVAL_MS = 500;
const SUPPRESS_EMIT_MS = 800;

// How long after a manual user action we lock out incoming sync events.
// Server heartbeat is every 3 s, so after this window the next heartbeat
// will already carry our action's effect.
const MANUAL_LOCK_MS = 1500;

// Allow incoming events whose updatedAt is at most this far behind our
// last manual action — covers normal client/server clock skew + RTT.
const STALE_GUARD_MS = 250;

async function pickInitialVideo() {
    try {
        const list = await getPopularVideos();
        const v = Array.isArray(list) && list[0];
        if (v) return { id: v.id, videoId: v.id, title: v.title, thumbnail: v.thumbnail };
    } catch { /* fall through */ }
    return DEFAULT_VIDEO;
}

// Effective playback time accounting for the gap between the server-recorded
// updatedAt and now. Clients are assumed to be roughly NTP-synced.
function computeEffectiveTime(state) {
    if (!state) return 0;
    if (!state.isPlaying) return Math.max(0, state.currentTime || 0);
    const elapsedMs = Date.now() - (state.updatedAt || Date.now());
    return Math.max(0, (state.currentTime || 0) + elapsedMs / 1000);
}

export default function VideoPlayer() {
    const { currentVideo, roomId, playNext, playVideo } = usePlaylist();
    const [player, setPlayer] = useState(null);
    const [starting, setStarting] = useState(false);

    // Refs ensure socket-handler closures always see the latest values.
    const playerRef = useRef(null);
    const pendingStateRef = useRef(null);   // queued desired state (set before player ready)
    const lastStateRef = useRef(null);       // last accepted state (server or local manual)
    const suppressEmitRef = useRef(false);
    const suppressTimerRef = useRef(null);

    // ── Manual-action priority clock ───────────────────────────────
    // `lastUserActionAtRef` is the local timestamp of the most recent
    // human action (play / pause / seek). Incoming sync events with
    // `updatedAt < lastUserActionAt - STALE_GUARD_MS` are rejected
    // because they were produced before the server processed our
    // action — applying them would undo the user's intent.
    const lastUserActionAtRef = useRef(0);

    // For seek detection by polling.
    const lastPollTimeRef = useRef(0);
    const lastPollAtRef = useRef(0);

    const releaseSuppressLater = useCallback((ms = SUPPRESS_EMIT_MS) => {
        if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
        suppressTimerRef.current = setTimeout(() => {
            suppressEmitRef.current = false;
            suppressTimerRef.current = null;
        }, ms);
    }, []);

    // Returns true if the incoming server state is older than our
    // last manual action and therefore stale.
    const isStaleForLocal = useCallback((state) => {
        if (!state || !state.updatedAt) return false;
        const userTs = lastUserActionAtRef.current;
        if (!userTs) return false;
        return state.updatedAt < userTs - STALE_GUARD_MS;
    }, []);

    const applyState = useCallback((state) => {
        const p = playerRef.current;
        if (!p || !state) return;

        // Defense in depth: even if a stale state slipped through the
        // listener filter, refuse to apply it.
        if (isStaleForLocal(state)) return;

        const target = computeEffectiveTime(state);
        let local = 0;
        try { local = p.getCurrentTime() ?? 0; } catch { /* not ready */ }

        suppressEmitRef.current = true;

        if (Math.abs(local - target) > SEEK_THRESHOLD_S) {
            try { p.seekTo(target, true); } catch { /* */ }
            lastPollTimeRef.current = target;
            lastPollAtRef.current = Date.now();
        }
        try {
            if (state.isPlaying) p.playVideo();
            else p.pauseVideo();
        } catch { /* */ }

        lastStateRef.current = state;
        releaseSuppressLater();
    }, [releaseSuppressLater, isStaleForLocal]);

    const onReady = (event) => {
        const p = event.target;
        playerRef.current = p;
        setPlayer(p);

        // Suppress *before* autoplay can fire onPlay → emit a stale state.
        suppressEmitRef.current = true;

        const pending = pendingStateRef.current;
        pendingStateRef.current = null;
        if (pending) {
            // Apply synchronously — no setTimeout, to win the race against
            // YouTube's autoplay-driven onPlay callback.
            applyState(pending);
        } else {
            releaseSuppressLater(400);
        }

        try {
            lastPollTimeRef.current = p.getCurrentTime() ?? 0;
            lastPollAtRef.current = Date.now();
        } catch { /* */ }
    };

    // A manual action just happened: stamp the clock and snapshot the
    // local truth so drift correction has the right target.
    const recordManualAction = useCallback((isPlaying, currentTime) => {
        const now = Date.now();
        lastUserActionAtRef.current = now;
        lastStateRef.current = {
            isPlaying,
            currentTime,
            updatedAt: now
        };
        lastPollTimeRef.current = currentTime;
        lastPollAtRef.current = now;
    }, []);

    const onPlay = (event) => {
        if (suppressEmitRef.current || !roomId) return;
        try {
            const t = event.target.getCurrentTime();
            recordManualAction(true, t);
            socket.emit("video_state_change", {
                roomId,
                videoState: { isPlaying: true, currentTime: t }
            });
        } catch { /* */ }
    };

    const onPause = (event) => {
        if (suppressEmitRef.current || !roomId) return;
        try {
            const t = event.target.getCurrentTime();
            recordManualAction(false, t);
            socket.emit("video_state_change", {
                roomId,
                videoState: { isPlaying: false, currentTime: t }
            });
        } catch { /* */ }
    };

    // Subscribe to server playback events.
    useEffect(() => {
        if (!roomId) return;

        const handleStateUpdated = (state) => {
            // Reject events older than our last manual action — this is
            // the core race-condition fix. Stale heartbeats and in-flight
            // broadcasts can no longer overwrite the user's intent.
            if (isStaleForLocal(state)) return;

            // Within the manual-lock window, only accept events that are
            // clearly newer than the user's action (i.e. the server has
            // processed it). This handles the case where our action's
            // emit hasn't reached the server yet but a heartbeat does.
            const sinceManual = Date.now() - lastUserActionAtRef.current;
            if (sinceManual < MANUAL_LOCK_MS &&
                state?.updatedAt < lastUserActionAtRef.current + STALE_GUARD_MS) {
                return;
            }

            if (playerRef.current) applyState(state);
            else {
                pendingStateRef.current = state;
                lastStateRef.current = state;
            }
        };

        const handleVideoChanged = (payload) => {
            // A video change is always authoritative — reset everything.
            const next = payload?.playback || { isPlaying: true, currentTime: 0, updatedAt: Date.now() };
            pendingStateRef.current = next;
            lastStateRef.current = next;
            lastUserActionAtRef.current = 0;
        };

        const handleRoomData = (data) => {
            if (data?.playback) {
                pendingStateRef.current = data.playback;
                lastStateRef.current = data.playback;
                lastUserActionAtRef.current = 0;
            }
        };

        socket.on("video_state_updated", handleStateUpdated);
        socket.on("video_changed", handleVideoChanged);
        socket.on("room_data", handleRoomData);

        return () => {
            socket.off("video_state_updated", handleStateUpdated);
            socket.off("video_changed", handleVideoChanged);
            socket.off("room_data", handleRoomData);
        };
    }, [roomId, applyState, isStaleForLocal]);

    // Reset player ref whenever the iframe is going to remount.
    useEffect(() => {
        playerRef.current = null;
        setPlayer(null);
        lastUserActionAtRef.current = 0;
    }, [currentVideo?.videoId]);

    // Periodic drift correction. Skipped during manual-lock window so we
    // never claw the user back to a stale playhead.
    useEffect(() => {
        if (!roomId) return;
        const id = setInterval(() => {
            const state = lastStateRef.current;
            const p = playerRef.current;
            if (!state?.isPlaying || !p || suppressEmitRef.current) return;
            if (Date.now() - lastUserActionAtRef.current < MANUAL_LOCK_MS) return;
            try {
                const local = p.getCurrentTime() ?? 0;
                const target = computeEffectiveTime(state);
                if (Math.abs(local - target) > SEEK_THRESHOLD_S * 1.5) {
                    suppressEmitRef.current = true;
                    p.seekTo(target, true);
                    lastPollTimeRef.current = target;
                    lastPollAtRef.current = Date.now();
                    releaseSuppressLater(500);
                }
            } catch { /* */ }
        }, DRIFT_CHECK_INTERVAL_MS);
        return () => clearInterval(id);
    }, [roomId, releaseSuppressLater]);

    // Seek detection by polling. YouTube's IFrame API has no dedicated
    // "seek" event; we infer one whenever currentTime jumps by more than
    // SEEK_DETECT_THRESHOLD_S compared to its expected progression.
    // Required because pure seeks while paused never trigger play/pause
    // events.
    useEffect(() => {
        if (!roomId) return;
        const id = setInterval(() => {
            const p = playerRef.current;
            if (!p || suppressEmitRef.current) return;

            try {
                const now = Date.now();
                const local = p.getCurrentTime() ?? 0;
                const lastT = lastPollTimeRef.current;
                const lastAt = lastPollAtRef.current;
                const elapsed = (now - lastAt) / 1000;
                const wasPlaying = !!lastStateRef.current?.isPlaying;
                const expected = wasPlaying ? lastT + elapsed : lastT;
                const jump = Math.abs(local - expected);

                if (lastAt && jump > SEEK_DETECT_THRESHOLD_S) {
                    // Manual seek detected. Treat as a high-priority action.
                    recordManualAction(wasPlaying, local);
                    socket.emit("video_state_change", {
                        roomId,
                        videoState: { isPlaying: wasPlaying, currentTime: local }
                    });
                } else {
                    lastPollTimeRef.current = local;
                    lastPollAtRef.current = now;
                }
            } catch { /* */ }
        }, SEEK_POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [roomId, recordManualAction]);

    // YouTube's `start` playerVar loads the iframe at this position.
    const initialStart = (() => {
        const pending = pendingStateRef.current;
        if (!pending) return 0;
        return Math.max(0, Math.floor(computeEffectiveTime(pending)));
    })();

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            start: initialStart
        }
    };

    async function handleStart() {
        if (starting) return;
        setStarting(true);
        const video = await pickInitialVideo();
        playVideo(video);
        setStarting(false);
    }

    return (
        <section className={styles.section} aria-label="Lecteur vidéo">
            <div className={styles.container}>
                {currentVideo ? (
                    <div className={styles.videoWrapper}>
                        <YouTube
                            // Force remount when the videoId changes so the new video is loaded cleanly.
                            key={currentVideo.videoId || currentVideo.id}
                            videoId={currentVideo.videoId || currentVideo.id}
                            opts={opts}
                            onReady={onReady}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={() => playNext()}
                            className={styles.iframe}
                            iframeClassName={styles.iframe}
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        className={styles.placeholderBtn}
                        onClick={handleStart}
                        disabled={starting}
                    >
                        <span className="material-symbols-outlined">play_circle</span>
                        <span className={styles.placeholderTitle}>
                            {starting ? 'Lancement…' : 'Démarrer la session'}
                        </span>
                        <span className={styles.placeholderHint}>
                            Une vidéo éducative sera lancée pour tous les membres.
                        </span>
                    </button>
                )}
            </div>

            {currentVideo && <VideoMarkers player={player} videoId={currentVideo.videoId || currentVideo.id} />}
        </section>
    );
}
