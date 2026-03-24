import { useEffect, useState } from "react";
import Card from "../component/ui/Card.jsx";
import styles from "./MembersList.module.css";
import socket from "../services/socket.js";

export default function MembersList({ roomId }) {
    const [members, setMembers] = useState([]);
    const [admin, setAdmin] = useState(null);
    const currentUser = localStorage.getItem("username") || "Invité";

    useEffect(() => {
        // Handle incoming admin from room_data
        const handleRoomData = (data) => {
            if (data.admin) setAdmin(data.admin);
        };

        const handleMembersUpdated = (updatedMembers) => {
            setMembers(updatedMembers);
        };

        socket.on("room_data", handleRoomData);
        socket.on("members_updated", handleMembersUpdated);

        return () => {
            socket.off("room_data", handleRoomData);
            socket.off("members_updated", handleMembersUpdated);
        };
    }, []);

    const handleKick = (targetSocketId) => {
        if (currentUser === admin) {
            socket.emit("kick_user", { roomId, targetSocketId });
        }
    };

    return (
        <Card iconName="group" title={`Membres (${members.length})`} className={styles.membersCard}>
            <ul className={styles.membersList}>
                {members.map((member) => (
                    <li key={member.socketId} className={styles.memberItem}>
                        <div className={styles.memberInfo}>
                            <span className={styles.memberName}>
                                {member.username} {member.username === currentUser ? "(Moi)" : ""}
                            </span>
                            {member.username === admin && (
                                <span className={styles.adminBadge}>Admin</span>
                            )}
                        </div>
                        {currentUser === admin && member.username !== admin && (
                            <button 
                                className={styles.kickBtn}
                                onClick={() => handleKick(member.socketId)}
                            >
                                Exclure
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
