import React, { useState } from 'react';
import styles from './Message.module.css';

export default function Message({
    children,
    variant = "send" // "send" (utilisateur) ou "receive" (autres)
}) {
    // Calcul de l'heure actuelle (à remplacer par une prop 'timestamp' plus tard)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    const isUser = variant === "send";



    return (
        <div className={`${styles.group} ${isUser ? styles.send : styles.receive}`}>
            {!isUser && (
                <div className={styles.avatar}>
                    <span className="material-symbols-outlined">person</span>
                </div>
            )}
            <div className={styles.bubbleWrapper}>
                <div className={styles.bubble}>
                    <p className={styles.text}>{children}</p>
                    <span className={styles.time}>{timeString}</span>
                </div>
            </div>
        </div>
    );
}