import styles from './Message.module.css';

function Tail({ side }) {
    // SVG identical to iMessage chat bubble tail.
    return (
        <svg
            className={`${styles.tail} ${side === 'right' ? styles.tailRight : styles.tailLeft}`}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
        >
            {side === 'right' ? (
                <path d="M0 0 C 0 6, 4 12, 14 14 L 14 0 Z" />
            ) : (
                <path d="M14 0 C 14 6, 10 12, 0 14 L 0 0 Z" />
            )}
        </svg>
    );
}

export default function Message({
    children,
    variant = 'receive',
    tail = true,
    showSender = false,
    senderLabel
}) {
    const isMe = variant === 'send';

    return (
        <div className={`${styles.row} ${isMe ? styles.rowMe : styles.rowThem}`}>
            <div className={styles.column}>
                {showSender && !isMe && senderLabel && (
                    <span className={styles.senderLabel}>{senderLabel}</span>
                )}
                <div className={`${styles.bubble} ${isMe ? styles.send : styles.receive}`}>
                    {children}
                    {tail && <Tail side={isMe ? 'right' : 'left'} />}
                </div>
            </div>
        </div>
    );
}
