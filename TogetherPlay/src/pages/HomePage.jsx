import HeaderPrimary from "../component/layout/HeaderPrimary.jsx";
import SuggestionsGrid from "../features/SuggestionsGrid.jsx";
import Playlist from "../features/Playlist.jsx";
import Chat from "../features/Chat.jsx";
import VideoPlayer from "../features/VideoPlayer.jsx";
import styles from "./HomePage.module.css";
import { useState } from "react";
import SearchResults from "../features/SearchResults.jsx";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (

        <div className={styles.pageWrapper}>

            <HeaderPrimary onSearch={handleSearch} />

            <div className={styles.layout}>
                <main className={styles.main}>
                    {/* Si on cherche : on affiche les résultats. Sinon : Video + Suggestions */}
                    {searchQuery ? (
                        <SearchResults query={searchQuery} />
                    ) : (
                        <>
                            <VideoPlayer />
                            <SuggestionsGrid />
                        </>
                    )}
                </main>

                <aside className={styles.aside}>
                    <Playlist />
                    <Chat />
                </aside>
            </div>

        </div>
    )
}