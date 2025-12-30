import styles from './SuggestionsGrid.module.css';
import SuggestionItem from "../component/ui/SuggestionItem.jsx";
import { useEffect, useState } from "react";
import { getPopularVideos } from "../services/youtube.js";

export default function SuggestionsGrid() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const videos = await getPopularVideos();
                setSuggestions(videos);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopular();
    }, []);

    if (loading) return <div className={styles.loading}>Chargement des suggestions...</div>;

    return (
        <section className={styles.section} aria-label="Suggestions de vidéos">
            <h2 className={styles.title}>Vidéos Populaires</h2>
            <div className={styles.grid}>
                {suggestions.map((video) => (
                    <SuggestionItem key={video.id} video={video} />
                ))}
            </div>
        </section>
    );
}