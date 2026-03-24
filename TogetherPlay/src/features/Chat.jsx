import Card from "../component/ui/Card.jsx";
import Message from "../component/ui/Message.jsx";
import Input from "../component/ui/Input.jsx";
import styles from "./Chat.module.css";
import { useEffect, useState, useRef } from "react";
import socket from "../services/socket.js";

export default function Chat({ roomId }) {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Demande l'historique de messages explicitement pour se découpler du "join_room" de HomePage
        socket.emit("get_messages", roomId);

        const handleMessageHistory = (history) => {
            if (history) setMessages(history);
        };

        const handleReceiveMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        // Initial load from history
        socket.on("message_history", handleMessageHistory);

        // Listen for new messages
        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("message_history", handleMessageHistory);
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [roomId]);

    // Envoyer un message
    function handleSubmit(e) {
        e.preventDefault();
        const text = e.target.elements.message.value;

        if (!text.trim()) return;

        // Get username from local storage or default
        const storedUsername = localStorage.getItem("username") || "Invité";

        const messageData = {
            roomId,
            message: {
                sender: storedUsername,
                text,
                date: Date.now()
            }
        };

        // On envoie au serveur
        socket.emit("send_message", messageData);

        e.target.reset();
    }

    return (
        <>
            <Card iconName={"chat_bubble"} title={"Messages"} className={styles.chatCard}>

                <div className={styles.messages}>
                    {messages.map((msg, i) => (
                        <Message key={i} variant={msg.sender === (localStorage.getItem("username") || "me") ? "send" : "receive"}>
                            {/* Small tweak: if sender is "me" locally, or matches username */}
                            {/* For now let's assume sender name display isn't fully separate from variant, 
                                 but the variant depends on if *I* sent it. 
                              */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', alignSelf: msg.sender === localStorage.getItem("username") ? 'flex-end' : 'flex-start' }}>
                                    {msg.sender}
                                </span>
                                <span>{msg.text}</span>
                            </div>
                        </Message>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className={styles.messageInputForm} aria-label="Envoyer un message">
                    <Input
                        variant={"chat"}
                        name={"message"}
                        placeholder={"Envoyer un message"}
                        ariaLabel={"Envoyer un message"}
                    />

                    <button type="submit" className={styles.sendBtn} aria-label="Envoyer le message">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>

            </Card>
        </>
    );
}