import HeaderPrimary from "../component/layout/HeaderPrimary.jsx";
import SuggestionsGrid from "../features/SuggestionsGrid.jsx";
import Playlist from "../features/Playlist.jsx";
import Chat from "../features/Chat.jsx";

// Import du module CSS
import styles from "./HomePage.module.css";

export default function HomePage() {
    return (
        <>
            <HeaderPrimary />

            {/* Le conteneur principal avec la grille */}
            <div className={styles.layout}>

                {/* Colonne de Gauche : Vidéo + Suggestions */}
                <main className={styles.main}>

                    {/* Placeholder du Lecteur Vidéo (Temporaire) */}
                    <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '24px', flexShrink: 0 }}>
                        <h2 style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>
                            Lecteur Vidéo
                        </h2>
                    </div>

                    <SuggestionsGrid />
                </main>

                {/* Colonne de Droite : Playlist + Chat */}
                <aside className={styles.aside}>
                    <Playlist />
                    <Chat />
                </aside>

            </div>
        </>
    )
}