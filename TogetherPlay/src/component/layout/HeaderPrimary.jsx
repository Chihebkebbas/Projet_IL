import styles from './HeaderPrimary.module.css'
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import logo from "../../assets/images/logo.png"

export default function HeaderPrimary(props) {
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
                <Button type="button" variant="glass" size="default">Copier le lien</Button>
                <Button type="button" variant="glass" size="iconOnly" iconName="settings" aria-label="Paramètres" />

            </nav>
        </header>
    )
}