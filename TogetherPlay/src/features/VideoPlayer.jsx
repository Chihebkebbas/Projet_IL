import { useState, useEffect } from 'react';
import styles from './VideoPlayer.module.css';
import thumbnail from '../assets/images/youtube.jpg';
import { usePlaylist } from "../context/HomePlaylistContext.jsx";

export default function VideoPlayer() {
    const { currentVideo } = usePlaylist();
    const [isPlaying, setIsPlaying] = useState(false);

    // Reset playing state when video changes
    useEffect(() => {
        if (currentVideo) setIsPlaying(true);
    }, [currentVideo]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <section className={styles.section} aria-label="Lecteur vidéo">
            <div className={styles.container}>
                {currentVideo ? (
                    <div className={styles.videoWrapper}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                            title={currentVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.iframe}
                        ></iframe>
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

                {/* Interface des contrôles */}
                <div className={styles.controls} aria-label="Contrôles vidéo">

                    {/* Barre de progression */}
                    <div className={styles.progressBar} role="slider" aria-label="Progression">
                        <div className={styles.progressFill}></div>
                    </div>

                    {/* Boutons */}
                    <div className={styles.controlsRow}>

                        {/* Groupe Gauche : Lecture, Volume... */}
                        <div className={styles.sideControls}>
                            <button
                                type="button"
                                className={styles.btn}
                                aria-label={isPlaying ? "Pause" : "Lecture"}
                                onClick={togglePlay}
                            >
                                <span className="material-symbols-outlined">
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>
                            <button type="button" className={styles.btn} aria-label="Reculer de 10s">
                                <span className="material-symbols-outlined">replay_10</span>
                            </button>
                            <button type="button" className={styles.btn} aria-label="Avancer de 10s">
                                <span className="material-symbols-outlined">forward_10</span>
                            </button>
                            <button type="button" className={styles.btn} aria-label="Volume">
                                <span className="material-symbols-outlined">volume_up</span>
                            </button>
                        </div>
                        {/* Groupe Droite : Paramètres, Plein écran */}
                        <div className={styles.sideControls}>
                            <button type="button" className={styles.btn} aria-label="Sous-titres">
                                <span className="material-symbols-outlined">closed_caption</span>
                            </button>
                            <button type="button" className={styles.btn} aria-label="Paramètres vidéo">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <button type="button" className={styles.btn} aria-label="Plein écran">
                                <span className="material-symbols-outlined">fullscreen</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}