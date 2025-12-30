import styles from './NotFoundPage.module.css';
import Button from "../component/ui/Button.jsx";
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.description}>Oups ! La page que vous cherchez semble avoir disparu dans le néant.</p>
            <Link to="/">
                <Button variant="primary" size="large">Retour à l'accueil</Button>
            </Link>
        </main>
    );
}
