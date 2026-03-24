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
    const { setRoomId, updatePlaylistFromSocket, playVideo, playVideoFromSocket, items, updateMarkersFromSocket, addMarkerFromSocket } = usePlaylist();

    useEffect(() => {
        if (!roomId) {
            navigate("/");
            return;
        }

        // Set roomId in context so actions emit to this room
        setRoomId(roomId);

        // Join the room
        const username = localStorage.getItem("username") || "Invité";
        socket.emit("join_room", { roomId, username });

        const handleRoomData = (data) => {
            if (data.playlist) updatePlaylistFromSocket(data.playlist);
            if (data.currentVideo) playVideoFromSocket(data.currentVideo);
            if (data.markers) updateMarkersFromSocket(data.markers);
        };

        const handlePlaylistUpdated = (newPlaylist) => {
            updatePlaylistFromSocket(newPlaylist);
        };

        const handleVideoChanged = (video) => {
            playVideoFromSocket(video);
        };

        const handleReceiveMarker = (marker) => {
            addMarkerFromSocket(marker);
        };

        const handleKicked = () => {
            navigate("/");
        };

        // Listen for initial room data
        socket.on("room_data", handleRoomData);

        // Listen for updates from other users
        socket.on("playlist_updated", handlePlaylistUpdated);
        socket.on("video_changed", handleVideoChanged);
        socket.on("receive_marker", handleReceiveMarker);
        socket.on("kicked", handleKicked);

        return () => {
            setRoomId(null);
            socket.off("room_data", handleRoomData);
            socket.off("playlist_updated", handlePlaylistUpdated);
            socket.off("video_changed", handleVideoChanged);
            socket.off("receive_marker", handleReceiveMarker);
            socket.off("kicked", handleKicked);
            // Optional: socket.emit("leave_room", roomId);
        }
    }, [roomId, navigate, setRoomId, updatePlaylistFromSocket, playVideo, playVideoFromSocket, updateMarkersFromSocket, addMarkerFromSocket]);

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