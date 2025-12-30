import styles from './Card.module.css'

export default function Card({
    children, title, iconName, className = "", ...props
}) {

    return (
        <section className={`${styles.card} ${className}`}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`${styles.icon} material-symbols-outlined`}>
                        {iconName}
                    </span>
                    <h2 className={styles.title}>{title}</h2>
                </div>
                {/* Actions optionnelles (ex: bouton vider, bouton shuffle) */}
                {props.actions && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {props.actions}
                    </div>
                )}
            </div>
            <hr className={styles.separator} />
            <div className={styles.container}>
                {children}
            </div>
        </section>)
}