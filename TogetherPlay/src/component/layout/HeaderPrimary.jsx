import styles from './HeaderPrimary.module.css'
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import logo from "../../assets/images/logo.png"
import { useState } from 'react';
import MembersList from "../../features/MembersList.jsx";

export default function HeaderPrimary(props) {
    const [showMembers, setShowMembers] = useState(false);
    return (
        <header className={`${styles.header}`}>
            <div
                onClick={props.onLogoClick}
                style={{ cursor: props.onLogoClick ? 'pointer' : 'default' }}
                role="button"
                aria-label="Retour à l'accueil"
                tabIndex={0}
            >
                <img className={`${styles.logo}`} src={logo} alt="Logo Together Play" />
            </div>
            <form className={`${styles.container}`} role="search" onSubmit={(e) => {
                e.preventDefault();
                // On récupère la valeur de l'input nommé "search"
                const formData = new FormData(e.target);
                const query = formData.get("search");
                if (props.onSearch) {
                    props.onSearch(query);
                }
            }}>
                <Input type="search" name="search" variant="search" placeholder="Rechercher" ariaLabel="Rechercher" />
                <button type="submit" className={styles.searchBtn} aria-label="Lancer la recherche">
                    <span className={`${styles.icon} material-symbols-outlined`}>search</span>
                </button>
            </form>
            <nav className={`${styles.actions}`} aria-label="Actions du header">
                {/* Show Copy Link only if we have a room ID (passed via props) */}
                {props.roomId && (
                    <Button
                        type="button"
                        variant="glass"
                        size="default"
                        onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(url)
                                .then(() => alert("Lien copié !"))
                                .catch(err => console.error("Erreur copie", err));
                        }}
                    >
                        Copier le lien
                    </Button>
                )}
                {props.roomId ? (
                    <div style={{ position: 'relative' }}>
                        <Button 
                            type="button" 
                            variant="glass" 
                            size="iconOnly" 
                            iconName="group" 
                            aria-label="Membres" 
                            onClick={() => setShowMembers(!showMembers)} 
                        />
                        <div style={{ display: showMembers ? 'block' : 'none', position: 'absolute', top: 'calc(100% + 15px)', right: 0, minWidth: '300px', zIndex: 9999 }}>
                            <MembersList roomId={props.roomId} />
                        </div>
                    </div>
                ) : (
                    <Button type="button" variant="glass" size="iconOnly" iconName="settings" aria-label="Paramètres" />
                )}

            </nav>
        </header>
    )
}