import styles from './Header.module.css'
import Button from "../ui/Button.jsx";
import logo from "../../assets/images/logo.png"
import { useWelcomeAction } from "../../context/WelcomeActionContext.jsx";


export default function Header() {

    const {setAction} = useWelcomeAction();

    return (
        <header className={styles.header}>
            <div className="logo">
                <img className={styles.logo} src={logo} alt="Logo Together Play"/>
            </div>

            <nav className={`${styles.actions}`} aria-label="Navigation principale">
                <Button onClick={() => setAction("create")} type="button" variant="glass" size="large">Créer un salon</Button>
                <Button onClick={() => setAction("join")} type="button" variant="glass" size="large">Rejoindre</Button>
            </nav>
        </header>
    )
}