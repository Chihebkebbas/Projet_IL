import HeaderPrimary from "../component/layout/HeaderPrimary.jsx";
import SuggestionsGrid from "../features/SuggestionsGrid.jsx";
import Playlist from "../features/Playlist.jsx";
import Chat from "../features/Chat.jsx";
import VideoPlayer from "../features/VideoPlayer.jsx"; // 1. On importe le Player

import styles from "./HomePage.module.css";

export default function HomePage() {
    return (
        <>
            <HeaderPrimary />

            <div className={styles.layout}>

                <main className={styles.main}>

                    {/* 2. On remplace la div noire temporaire par le composant */}
                    <VideoPlayer />

                    <SuggestionsGrid />
                </main>

                <aside className={styles.aside}>
                    <Playlist />
                    <Chat />
                </aside>

            </div>
        </>
    )
}