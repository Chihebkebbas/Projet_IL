import HeaderPrimary from "../component/layout/HeaderPrimary.jsx";
import SuggestionsGrid from "../features/SuggestionsGrid.jsx";
import Playlist from "../features/Playlist.jsx";
import Chat from "../features/Chat.jsx";
import VideoPlayer from "../features/VideoPlayer.jsx";
import styles from "./HomePage.module.css";

export default function HomePage() {
    return (

        <div className={styles.pageWrapper}>

            <HeaderPrimary />

            <div className={styles.layout}>
                <main className={styles.main}>
                    <VideoPlayer />
                    <SuggestionsGrid />
                </main>

                <aside className={styles.aside}>
                    <Playlist />
                    <Chat />
                </aside>
            </div>

        </div>
    )
}