import { useState } from 'react';
import styles from './VideoMarkers.module.css';
import Input from '../component/ui/Input.jsx';
import Button from '../component/ui/Button.jsx';
import { usePlaylist } from '../context/HomePlaylistContext.jsx';
import socket from '../services/socket.js';

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function VideoMarkers({ player }) {
    const { markers, roomId } = usePlaylist();
    const [markerText, setMarkerText] = useState('');

    const handleAddMarker = (e) => {
        e.preventDefault();

        if (!markerText.trim() || !player || !roomId) return;

        const currentTime = player.getCurrentTime();
        const author = localStorage.getItem("username") || "Anonyme";

        const newMarker = {
            time: currentTime,
            text: markerText.trim(),
            author: author
        };

        // Envoi au serveur
        socket.emit("add_marker", {
            roomId,
            marker: newMarker
        });

        setMarkerText('');
    };

    const handleSeekToMarker = (time) => {
        if (player) {
            player.seekTo(time, true);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Annotations en direct</h3>

            <form onSubmit={handleAddMarker} className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                    <Input
                        value={markerText}
                        onChange={(e) => setMarkerText(e.target.value)}
                        placeholder="Ajouter une note à ce moment..."
                        ariaLabel="Texte du marqueur"
                        iconName="edit"
                    />
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    ariaLabel="Sauvegarder la note"
                >
                    Ajouter
                </Button>
            </form>

            {markers.length > 0 ? (
                <ul className={styles.markersList}>
                    {markers
                        .slice() // create a copy before sorting
                        .sort((a, b) => a.time - b.time) // sort chronologically
                        .map((marker, index) => (
                            <li
                                key={index}
                                className={styles.markerItem}
                                onClick={() => handleSeekToMarker(marker.time)}
                            >
                                <span className={styles.markerTime}>
                                    {formatTime(marker.time)}
                                </span>
                                <div className={styles.markerContent}>
                                    <p className={styles.markerText}>{marker.text}</p>
                                    <span className={styles.markerAuthor}>{marker.author}</span>
                                </div>
                            </li>
                        ))}
                </ul>
            ) : (
                <div className={styles.emptyState}>
                    Aucune annotation pour cette vidéo.
                </div>
            )}
        </div>
    );
}
