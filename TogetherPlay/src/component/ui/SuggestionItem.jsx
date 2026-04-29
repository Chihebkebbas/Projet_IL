import styles from './SuggestionItem.module.css';
import { usePlaylist } from "../../context/HomePlaylistContext.jsx";

export default function SuggestionItem({ video }) {
    const { addItem, playVideo } = usePlaylist();

    function handleAddItem(e) {
        e.stopPropagation();
        addItem({
            videoId: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration
        });
    }

    function handleCardClick() {
        playVideo(video);
    }

    return (
        <article className={styles.card} onClick={handleCardClick}>
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
    );
}
