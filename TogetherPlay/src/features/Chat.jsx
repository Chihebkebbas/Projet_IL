import Card from "../component/ui/Card.jsx";
import Message from "../component/ui/Message.jsx";
import Input from "../component/ui/Input.jsx";
import styles from "./Chat.module.css";
import { useEffect, useState, useRef, useMemo } from "react";
import socket from "../services/socket.js";

const TIME_SEP_MS = 5 * 60 * 1000; // show timestamp separator after 5 min gap

function formatTimeSeparator(date) {
    const d = new Date(date);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return time;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `Hier ${time}`;
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) + ' · ' + time;
}

// Build a list of render items: timestamp separators + grouped messages.
function buildRenderItems(messages, me) {
    const items = [];
    let prevTs = 0;
    let prevSender = null;

    messages.forEach((msg, i) => {
        const ts = msg.date ? new Date(msg.date).getTime() : 0;
        const sender = msg.sender;
        const senderChanged = sender !== prevSender;
        const bigGap = ts && prevTs && ts - prevTs > TIME_SEP_MS;

        if (i === 0 || bigGap) {
            items.push({ kind: 'time', id: `t-${i}`, label: formatTimeSeparator(ts || Date.now()) });
        }

        // Tail = last in a consecutive run from the same sender (next msg different or last)
        const next = messages[i + 1];
        const isLastInRun =
            !next ||
            next.sender !== sender ||
            (next.date && new Date(next.date).getTime() - ts > TIME_SEP_MS);

        items.push({
            kind: 'msg',
            id: `m-${i}-${ts}`,
            mine: sender === me,
            text: msg.text,
            sender,
            tail: isLastInRun,
            showSender: senderChanged && sender !== me,
            tightTop: !senderChanged && !bigGap && i !== 0
        });

        prevTs = ts;
        prevSender = sender;
    });

    return items;
}

export default function Chat({ roomId }) {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const me = (typeof window !== 'undefined' && localStorage.getItem("username")) || "Invité";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const handleRoomData = (data) => {
            if (data?.messages) setMessages(data.messages);
        };
        const handleReceiveMessage = (data) => {
            setMessages((prev) => [...prev, data]);
        };

        socket.on("room_data", handleRoomData);
        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("room_data", handleRoomData);
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [roomId]);

    function handleSubmit(e) {
        e.preventDefault();
        const input = e.target.elements.message;
        const text = input.value.trim();
        if (!text || text.length > 300) return;

        socket.emit("send_message", {
            roomId,
            message: { text }
        });

        input.value = '';
    }

    const renderItems = useMemo(() => buildRenderItems(messages, me), [messages, me]);

    return (
        <Card iconName={"chat_bubble"} title={"Messages"} className={styles.chatCard}>
            <div className={styles.messages}>
                {renderItems.map((item) => {
                    if (item.kind === 'time') {
                        return (
                            <div key={item.id} className={styles.timeSeparator}>
                                {item.label}
                            </div>
                        );
                    }
                    return (
                        <div
                            key={item.id}
                            className={`${styles.messageWrap} ${item.tightTop ? styles.tight : ''}`}
                        >
                            <Message
                                variant={item.mine ? 'send' : 'receive'}
                                tail={item.tail}
                                showSender={item.showSender}
                                senderLabel={item.sender}
                            >
                                {item.text}
                            </Message>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className={styles.messageInputForm} aria-label="Envoyer un message">
                <Input
                    variant={"chat"}
                    name={"message"}
                    placeholder={"Écrire un message…"}
                    ariaLabel={"Envoyer un message"}
                    maxLength={300}
                    autoComplete="off"
                />
                <button type="submit" className={styles.sendBtn} aria-label="Envoyer le message">
                    <span className="material-symbols-outlined">arrow_upward</span>
                </button>
            </form>
        </Card>
    );
}
