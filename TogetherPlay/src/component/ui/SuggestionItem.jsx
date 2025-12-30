import styles from './SuggestionItem.module.css';
import { usePlaylist } from "../../context/HomePlaylistContext.jsx";

export default function SuggestionItem({ video }) {

    const { addItem } = usePlaylist(); // Assurez-vous d'avoir exporté addItem dans votre Context !

    function handleAddItem(e) {
        e.stopPropagation(); // Empêche de lancer la vidéo si on clique juste sur "Ajouter"

        // On crée un nouvel objet pour la playlist basé sur la suggestion
        const newItem = {
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration // Si vous avez cette info
        };

        addItem(newItem);
    }

    return (
        <article className={styles.card}>
            <div className={styles.thumbnailWrapper}>
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={styles.thumbnail}
                />
            </div>
            <div className={styles.info}>
                <p className={styles.title} title={video.title}>
                    {video.title}
                </p>
                <button
                    type="button"
                    className={styles.addToPlaylistBtn}
                    aria-label="Ajouter à la playlist"
                    onClick={handleAddItem}
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>
        </article>
    )
}