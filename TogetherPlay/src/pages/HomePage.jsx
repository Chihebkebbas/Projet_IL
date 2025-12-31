import HeaderPrimary from "../component/layout/HeaderPrimary.jsx";
import SuggestionsGrid from "../features/SuggestionsGrid.jsx";
import Playlist from "../features/Playlist.jsx";
import Chat from "../features/Chat.jsx";
import VideoPlayer from "../features/VideoPlayer.jsx";
import styles from "./HomePage.module.css";
import { useState, useEffect } from "react";
import SearchResults from "../features/SearchResults.jsx";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../services/socket.js";
import { usePlaylist } from "../context/HomePlaylistContext.jsx";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { setRoomId, updatePlaylistFromSocket, playVideo, items } = usePlaylist();

    useEffect(() => {
        if (!roomId) {
            navigate("/");
            return;
        }

        // Set roomId in context so actions emit to this room
        setRoomId(roomId);

        // Join the room
        socket.emit("join_room", roomId);

        // Listen for initial room data
        socket.on("room_data", (data) => {
            // data = { playlist, messages, currentVideo }
            // Note: Messages are handled by Chat component independently via socket event, 
            // OR we can pass them down. For simplicity, Chat listens to 'receive_message',
            // but we might want to load history. 
            // The backend sends 'room_data' which contains history.

            if (data.playlist) updatePlaylistFromSocket(data.playlist);
            if (data.currentVideo) playVideo(data.currentVideo);
        });

        // Listen for updates from other users
        socket.on("playlist_updated", (newPlaylist) => {
            updatePlaylistFromSocket(newPlaylist);
        });

        return () => {
            setRoomId(null);
            socket.off("room_data");
            socket.off("playlist_updated");
            // Optional: socket.emit("leave_room", roomId);
        }
    }, [roomId, navigate, setRoomId, updatePlaylistFromSocket, playVideo]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleLogoClick = () => {
        setSearchQuery(""); // Reset search to show default home view
    };

    return (
        <div className={styles.pageWrapper}>

            <HeaderPrimary onSearch={handleSearch} onLogoClick={handleLogoClick} roomId={roomId} />

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
                    <Playlist roomId={roomId} />
                    <Chat roomId={roomId} />
                </aside>
            </div>

        </div>
    )
}