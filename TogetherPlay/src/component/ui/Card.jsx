import styles from './Card.module.css'

export default function Card({
                                 children, title, iconName
                             }) {

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <span className={`${styles.icon} material-symbols-outlined`}>
                    {iconName}
                </span>
                <h2 className={styles.title}>{title}</h2>
            </div>
            <hr className={styles.separator}/>
            <div className={styles.container}>
                {children}
            </div>
        </section>)
}