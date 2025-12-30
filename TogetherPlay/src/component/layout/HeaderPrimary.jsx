import styles from './HeaderPrimary.module.css'
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import logo from "../../assets/images/logo.png"

export default function HeaderPrimary() {
    return (
        <header className={`${styles.header}`}>
            <div>
                <img className={`${styles.logo}`} src={logo} alt="Logo Together Play"/>
            </div>
            <div className={`${styles.container}`}>
                <Input type="search" variant="search" placeholder="Rechercher" ariaLabel="Rechercher"/>
                <span className={`${styles.icon} material-symbols-outlined`}>search</span>
            </div>
            <nav className={`${styles.actions}`} aria-label="Actions du header">
                <Button type="button" variant="glass" size="default">Copier le lien</Button>
                <Button type="button" variant="glass" size="iconOnly" iconName="settings" aria-label="Paramètres" />

            </nav>
        </header>
    )
}