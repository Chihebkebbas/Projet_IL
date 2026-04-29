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
    const {
        setRoomId, setAdmin,
        updatePlaylistFromSocket, playVideoFromSocket,
        updateMarkersFromSocket, addMarkerFromSocket
    } = usePlaylist();

    useEffect(() => {
        if (!roomId) {
            navigate("/");
            return;
        }

        setRoomId(roomId);

        const username = localStorage.getItem("username") || "Invité";
        socket.emit("join_room", { roomId, username });

        const handleRoomData = (data) => {
            if (data.admin) setAdmin(data.admin);
            if (data.playlist) updatePlaylistFromSocket(data.playlist);
            if (data.currentVideo) playVideoFromSocket(data.currentVideo);
            if (data.markers) updateMarkersFromSocket(data.markers);
        };
        const handlePlaylistUpdated = (newPlaylist) => updatePlaylistFromSocket(newPlaylist);
        const handleVideoChanged = (payload) => {
            // Server now emits { video, playback }; older shape was just the video.
            const video = payload?.video ?? payload;
            playVideoFromSocket(video);
        };
        const handleReceiveMarker = (marker) => addMarkerFromSocket(marker);
        const handleKicked = () => navigate("/");
        const handleRoomError = (err) => {
            console.error("Room error:", err?.message);
            navigate("/");
        };
        const handleSessionReplaced = () => {
            alert("Cette session a été ouverte dans un autre onglet ou navigateur.");
            navigate("/");
        };

        socket.on("room_data", handleRoomData);
        socket.on("playlist_updated", handlePlaylistUpdated);
        socket.on("video_changed", handleVideoChanged);
        socket.on("receive_marker", handleReceiveMarker);
        socket.on("kicked", handleKicked);
        socket.on("room_error", handleRoomError);
        socket.on("session_replaced", handleSessionReplaced);

        return () => {
            setRoomId(null);
            setAdmin(null);
            socket.off("room_data", handleRoomData);
            socket.off("playlist_updated", handlePlaylistUpdated);
            socket.off("video_changed", handleVideoChanged);
            socket.off("receive_marker", handleReceiveMarker);
            socket.off("kicked", handleKicked);
            socket.off("room_error", handleRoomError);
            socket.off("session_replaced", handleSessionReplaced);
        };
    }, [roomId, navigate, setRoomId, setAdmin, updatePlaylistFromSocket, playVideoFromSocket, updateMarkersFromSocket, addMarkerFromSocket]);

    const handleSearch = (query) => setSearchQuery(query);
    const handleLogoClick = () => setSearchQuery("");

    return (
        <div className={styles.pageWrapper}>
            <HeaderPrimary onSearch={handleSearch} onLogoClick={handleLogoClick} roomId={roomId} />

            <div className={styles.layout}>
                <main className={styles.main}>
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
    );
}
