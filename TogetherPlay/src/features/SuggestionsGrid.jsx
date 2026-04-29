import styles from './SuggestionsGrid.module.css';
import SuggestionItem from "../component/ui/SuggestionItem.jsx";
import { useEffect, useState } from "react";
import { getPopularVideos } from "../services/youtube.js";

const SKELETON_COUNT = 8;

export default function SuggestionsGrid() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchPopular = async () => {
            try {
                const videos = await getPopularVideos();
                if (!cancelled) setSuggestions(videos);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Erreur de chargement.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchPopular();
        return () => { cancelled = true; };
    }, []);

    return (
        <section className={styles.section} aria-label="Suggestions de vidéos">
            <h2 className={styles.title}>Sélection éducative</h2>
            <p className={styles.subtitle}>
                Cours, conférences et contenus universitaires en français.
            </p>

            {error && <p className={styles.error}>{error}</p>}

            {loading && !error ? (
                <div className={styles.grid} aria-hidden="true">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonThumb} />
                            <div className={styles.skeletonLine} />
                            <div className={`${styles.skeletonLine} ${styles.short}`} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.grid}>
                    {suggestions.map((video) => (
                        <SuggestionItem key={video.id} video={video} />
                    ))}
                </div>
            )}
        </section>
    );
}
