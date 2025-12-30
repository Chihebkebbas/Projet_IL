import styles from './SearchResults.module.css';
import SuggestionItem from "../component/ui/SuggestionItem.jsx";

// Mock Data for search results (can be same as suggestions/playlist for now)
import img1 from "../assets/images/thumbnail-1.jpg";
import img2 from "../assets/images/thumbnail-2.jpg";
import img3 from "../assets/images/thumbnail-3.jpg";
import img4 from "../assets/images/thumbnail-4.jpg";

const MOCK_RESULTS = [
    { id: 201, title: "Tuto : Intégration API YouTube (Partie 1)", thumbnail: img1 },
    { id: 202, title: "React Context API vs Redux - Lequel choisir ?", thumbnail: img2 },
    { id: 203, title: "Design System avec CSS Modules", thumbnail: img3 },
    { id: 204, title: "Déboguer une application React comme un Pro", thumbnail: img4 },
];

export default function SearchResults({ query }) {
    return (
        <section className={styles.section} aria-label="Résultats de recherche">
            <h2 className={styles.title}>
                Résultats pour : <span className={styles.highlight}>"{query}"</span>
            </h2>
            <div className={styles.grid}>
                {MOCK_RESULTS.map((video) => (
                    <SuggestionItem key={video.id} video={video} />
                ))}
            </div>
            {/* Placeholder pour message si vide */}
            {MOCK_RESULTS.length === 0 && (
                <p className={styles.noResults}>Aucun résultat trouvé pour cette recherche.</p>
            )}
        </section>
    );
}
