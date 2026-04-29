import styles from './SearchResults.module.css';
import SuggestionItem from "../component/ui/SuggestionItem.jsx";
import { useEffect, useState } from "react";
import { searchVideos } from "../services/youtube.js";

export default function SearchResults({ query }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) return;

        const fetchVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await searchVideos(query);
                setVideos(results);
            } catch (err) {
                console.error(err);
                setError("Impossible de récupérer les vidéos (Vérifiez la clé API).");
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchVideos();
        }, 500); // 500ms debounce to avoid too many calls

        return () => clearTimeout(debounce);

    }, [query]);

    return (
        <section className={styles.section} aria-label="Résultats de recherche">
            <h2 className={styles.title}>
                Résultats pour <span className={styles.highlight}>"{query}"</span>
            </h2>
            <p className={styles.subtitle}>Filtres : SafeSearch · FR · contenus intégrables</p>

            {loading && <p className={styles.loading}>Recherche en cours...</p>}

            {error && <p className={styles.error}>{error}</p>}

            {!loading && !error && (
                <div className={styles.grid}>
                    {videos.map((video) => (
                        <SuggestionItem key={video.id} video={video} />
                    ))}
                </div>
            )}

            {!loading && !error && videos.length === 0 && (
                <p className={styles.noResults}>Aucun résultat trouvé pour cette recherche.</p>
            )}
        </section>
    );
}
