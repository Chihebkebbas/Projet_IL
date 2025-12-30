import { useState } from 'react';
import styles from './VideoPlayer.module.css';
import thumbnail from '../assets/images/youtube.jpg'; // Image par défaut

export default function VideoPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);

    // Fonction simple pour basculer play/pause (pour l'UI seulement pour l'instant)
    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <section className={styles.section} aria-label="Lecteur vidéo">
            <div className={styles.container}>
                {/* Image Placeholder (sera remplacée par <video> ou <iframe> plus tard) */}
                <div className={styles.videoPlaceholder}>
                    <img
                        src={thumbnail}
                        alt="Vidéo en cours de lecture"
                        className={styles.thumbnail}
                    />
                </div>

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