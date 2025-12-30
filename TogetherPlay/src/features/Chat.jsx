import Card from "../component/ui/Card.jsx";
import Message from "../component/ui/Message.jsx";
import Input from "../component/ui/Input.jsx";
import styles from "./Chat.module.css";
import { useEffect, useState } from "react";
import { getMessages, saveMessages } from "../services/messagesStorage.js";

export default function Chat() {

    // Charger les messages depuis localStorage
    const [messages, setMessages] = useState(() => {
        return getMessages();
    });

    // Synchroniser les messages avec localStorage à chaque changement
    useEffect(() => {
        saveMessages(messages);
    }, [messages]);

    // Envoyer un message
    function handleSubmit(e) {
        e.preventDefault();
        const text = e.target.elements.message.value;

        if (!text.trim()) return;

        const newMessage = {
            sender: "me",
            text,
            date: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);

        e.target.reset();
    }

    return (
        <>
            <Card iconName={"chat_bubble"} title={"Messages"} className={styles.chatCard}>

                <div className={styles.messages}>
                    {messages.map((msg, i) => (
                        <Message key={i} variant={msg.sender === "me" ? "send" : "receive"}>
                            {msg.text}
                        </Message>
                    ))}
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