import Header from "../component/layout/Header.jsx";
import JoinForm from "../features/JoinForm.jsx";
import Footer from "../component/layout/Footer.jsx";
import styles from './WelcomePage.module.css';

const features = [
    { icon: "play_circle", label: "Lecture synchronisée" },
    { icon: "chat", label: "Chat temps réel" },
    { icon: "bookmark", label: "Annotations partagées" },
    { icon: "playlist_play", label: "Playlist collaborative" }
];

export default function WelcomePage() {
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <span className={styles.eyebrow}>Université d'Avignon · L3 Informatique</span>
                <h1 className={styles.title}>
                    Regardez vos vidéos ensemble,
                    <span className={styles.titleAccent}> en temps réel.</span>
                </h1>
                <p className={styles.subtitle}>
                    Créez un salon privé et invitez vos amis à regarder, discuter
                    et annoter vos vidéos préférées — tout est synchronisé.
                </p>

                <JoinForm />

                <ul className={styles.features} aria-label="Fonctionnalités">
                    {features.map(f => (
                        <li key={f.label} className={styles.feature}>
                            <span className="material-symbols-outlined">{f.icon}</span>
                            {f.label}
                        </li>
                    ))}
                </ul>

                <Footer />
            </main>
        </div>
    );
}
