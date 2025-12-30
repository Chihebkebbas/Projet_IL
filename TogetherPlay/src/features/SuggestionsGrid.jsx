import styles from './SuggestionsGrid.module.css';
import SuggestionItem from "../component/ui/SuggestionItem.jsx";

// Images (Assurez-vous que les chemins sont corrects)
import img1 from "../assets/images/thumbnail-1.jpg";
import img2 from "../assets/images/thumbnail-2.jpg";
import img3 from "../assets/images/thumbnail-3.jpg";
import img4 from "../assets/images/thumbnail-4.jpg";

const MOCK_SUGGESTIONS = [
    { id: 101, title: "Résumé : Le BARÇA fête son retour au CAMP NOU", thumbnail: img1 },
    { id: 102, title: "QUI EST L'IMPOSTEUR ? (ft Aya Nakamura)", thumbnail: img2 },
    { id: 103, title: "J'ai codé un algorithme qui reconnaît les gens", thumbnail: img3 },
    { id: 104, title: "Your Dream Body Won't Make You Happy", thumbnail: img4 },
    { id: 105, title: "Autre vidéo incroyable à ne pas rater", thumbnail: img1 },
    { id: 106, title: "Tuto React : Créer un clone de YouTube", thumbnail: img3 },
];

export default function SuggestionsGrid() {
    return (
        <section className={styles.section} aria-label="Suggestions de vidéos">
            <h2 className={styles.title}>Suggestions</h2>
            <div className={styles.grid}>
                {MOCK_SUGGESTIONS.map((video) => (
                    <SuggestionItem key={video.id} video={video} />
                ))}
            </div>
        </section>
    );
}