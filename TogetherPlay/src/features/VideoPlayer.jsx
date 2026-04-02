import { useState, useEffect, useRef } from 'react';
import styles from './VideoPlayer.module.css';
import thumbnail from '../assets/images/youtube.jpg';
import { usePlaylist } from "../context/HomePlaylistContext.jsx";
import YouTube from 'react-youtube';
import socket from "../services/socket.js";
import VideoMarkers from './VideoMarkers.jsx';

export default function VideoPlayer() {
    const { currentVideo, roomId, playNext } = usePlaylist(); 
    const [player, setPlayer] = useState(null);
    const isRemoteUpdate = useRef(false); 

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 1, 
            modestbranding: 1,
            rel: 0,
        },
    };

    const onReady = (event) => {
        setPlayer(event.target);
    };

    // --- EMIT EVENTS ---
    const onPlay = (event) => {
        if (isRemoteUpdate.current) return;
        if (roomId) {
            socket.emit("video_state_change", {
                roomId,
                videoState: { isPlaying: true, currentTime: event.target.getCurrentTime() }
            });
        }
    };

    const onPause = (event) => {
        if (isRemoteUpdate.current) return;
        if (roomId) {
            socket.emit("video_state_change", {
                roomId,
                videoState: { isPlaying: false, currentTime: event.target.getCurrentTime() }
            });
        }
    };


    // --- RECEIVE EVENTS ---
    useEffect(() => {
        if (!roomId || !player) return;

        socket.on("video_state_updated", (state) => {
            // state = { isPlaying, currentTime }
            isRemoteUpdate.current = true;

            const timeDiff = Math.abs(player.getCurrentTime() - state.currentTime);

            // Sync time if diff is large (> 2 seconds)
            if (timeDiff > 2) {
                player.seekTo(state.currentTime);
            }

            if (state.isPlaying) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }

            // Reset flag after a short delay
            setTimeout(() => {
                isRemoteUpdate.current = false;
            }, 500);
        });

        return () => {
            socket.off("video_state_updated");
        };
    }, [roomId, player]);




    return (
        <section className={styles.section} aria-label="Lecteur vidéo">
            <div className={styles.container}>
                {currentVideo ? (
                    <div className={styles.videoWrapper}>
                        <YouTube
                            videoId={currentVideo.videoId || currentVideo.id}
                            opts={opts}
                            onReady={onReady}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnd={() => playNext()}
                            className={styles.iframe} // We might need to adjust CSS if class isn't on iframe
                            iframeClassName={styles.iframe}
                        />
                    </div>
                ) : (
                    <div className={styles.videoPlaceholder}>
                        <img
                            src={thumbnail}
                            alt="Aucune vidéo sélectionnée"
                            className={styles.thumbnail}
                        />
                        <div className={styles.overlay}>
                            <p>Sélectionnez une vidéo pour commencer la lecture</p>
                        </div>
                    </div>
                )}
            </div>

            {currentVideo && <VideoMarkers player={player} />}
        </section>
    );
}