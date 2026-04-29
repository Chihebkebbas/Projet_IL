import styles from './HeaderPrimary.module.css';
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import logo from "../../assets/images/logo.png";
import { useState } from 'react';
import MembersList from "../../features/MembersList.jsx";

export default function HeaderPrimary({ onSearch, onLogoClick, roomId }) {
    const [showMembers, setShowMembers] = useState(false);

    function handleSearchSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = (formData.get("search") || "").toString().trim();
        if (onSearch) onSearch(query);
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(roomId);
            alert("Code copié !");
        } catch (err) {
            console.error("Erreur copie", err);
        }
    }

    return (
        <header className={styles.header}>
            <button
                type="button"
                className={styles.logoButton}
                onClick={onLogoClick}
                aria-label="Retour à l'accueil"
            >
                <img className={styles.logo} src={logo} alt="Logo Together Play" />
            </button>

            <form className={styles.container} role="search" onSubmit={handleSearchSubmit}>
                <Input type="search" name="search" variant="search" placeholder="Rechercher" ariaLabel="Rechercher" />
                <button type="submit" className={styles.searchBtn} aria-label="Lancer la recherche">
                    <span className={`${styles.icon} material-symbols-outlined`}>search</span>
                </button>
            </form>

            <nav className={styles.actions} aria-label="Actions du header">
                {roomId && (
                    <Button
                        type="button"
                        variant="glass"
                        size="default"
                        onClick={handleCopyLink}
                    >
                        Copier le code
                    </Button>
                )}
                {roomId ? (
                    <div className={styles.membersWrapper}>
                        <Button
                            type="button"
                            variant="glass"
                            size="iconOnly"
                            iconName="group"
                            aria-label="Membres"
                            onClick={() => setShowMembers(v => !v)}
                        />
                        <div className={`${styles.membersDropdown} ${showMembers ? styles.membersDropdownOpen : ''}`}>
                            <MembersList roomId={roomId} />
                        </div>
                    </div>
                ) : (
                    <Button type="button" variant="glass" size="iconOnly" iconName="settings" aria-label="Paramètres" />
                )}
            </nav>
        </header>
    );
}
