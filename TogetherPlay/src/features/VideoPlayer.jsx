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

const SEEK_THRESHOLD_S = 1.0;       // re-seek only if drift exceeds this
const DRIFT_CHECK_INTERVAL_MS = 2500;
const SUPPRESS_EMIT_MS = 800;

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
    const pendingStateRef = useRef(null);  // queued desired state (set before player ready)
    const lastStateRef = useRef(null);      // last server state we applied (for drift checks)
    const suppressEmitRef = useRef(false);
    const suppressTimerRef = useRef(null);

    const releaseSuppressLater = useCallback((ms = SUPPRESS_EMIT_MS) => {
        if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
        suppressTimerRef.current = setTimeout(() => {
            suppressEmitRef.current = false;
            suppressTimerRef.current = null;
        }, ms);
    }, []);

    const applyState = useCallback((state) => {
        const p = playerRef.current;
        if (!p || !state) return;

        const target = computeEffectiveTime(state);
        let local = 0;
        try { local = p.getCurrentTime() ?? 0; } catch { /* not ready */ }

        suppressEmitRef.current = true;

        if (Math.abs(local - target) > SEEK_THRESHOLD_S) {
            try { p.seekTo(target, true); } catch { /* */ }
        }
        try {
            if (state.isPlaying) p.playVideo();
            else p.pauseVideo();
        } catch { /* */ }

        lastStateRef.current = state;
        releaseSuppressLater();
    }, [releaseSuppressLater]);

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
    };

    const onPlay = (event) => {
        if (suppressEmitRef.current || !roomId) return;
        try {
            const t = event.target.getCurrentTime();
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
            socket.emit("video_state_change", {
                roomId,
                videoState: { isPlaying: false, currentTime: t }
            });
        } catch { /* */ }
    };

    // Subscribe to server playback events. Refs let us avoid resubscribing
    // when the player object changes — that would race with state updates
    // arriving in the same tick.
    useEffect(() => {
        if (!roomId) return;

        const handleStateUpdated = (state) => {
            if (playerRef.current) applyState(state);
            else {
                pendingStateRef.current = state;
                lastStateRef.current = state;
            }
        };

        const handleVideoChanged = (payload) => {
            const next = payload?.playback || { isPlaying: true, currentTime: 0, updatedAt: Date.now() };
            pendingStateRef.current = next;
            lastStateRef.current = next;
        };

        const handleRoomData = (data) => {
            if (data?.playback) {
                pendingStateRef.current = data.playback;
                lastStateRef.current = data.playback;
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
    }, [roomId, applyState]);

    // Reset player ref whenever the iframe is going to remount (key change below).
    useEffect(() => {
        playerRef.current = null;
        setPlayer(null);
    }, [currentVideo?.videoId]);

    // Periodic drift correction: if we've drifted from the expected effective
    // time by more than the threshold, snap back. Catches clients whose tab
    // was throttled / was buffering during the heartbeat window.
    useEffect(() => {
        if (!roomId) return;
        const id = setInterval(() => {
            const state = lastStateRef.current;
            const p = playerRef.current;
            if (!state?.isPlaying || !p || suppressEmitRef.current) return;
            try {
                const local = p.getCurrentTime() ?? 0;
                const target = computeEffectiveTime(state);
                if (Math.abs(local - target) > SEEK_THRESHOLD_S * 1.5) {
                    suppressEmitRef.current = true;
                    p.seekTo(target, true);
                    releaseSuppressLater(500);
                }
            } catch { /* */ }
        }, DRIFT_CHECK_INTERVAL_MS);
        return () => clearInterval(id);
    }, [roomId, releaseSuppressLater]);

    // YouTube's `start` playerVar loads the iframe at this position, which
    // eliminates the brief "flash from 0" a new joiner would otherwise see
    // before our seekTo() ran. Recomputed on every video remount.
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
