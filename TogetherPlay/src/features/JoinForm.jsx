import Input from "../component/ui/Input.jsx";
import Checkbox from "../component/ui/Checkbox.jsx";
import Button from "../component/ui/Button.jsx";
import styles from "./JoinForm.module.css";
import { useNavigate } from "react-router-dom";
import { useWelcomeAction } from "../context/WelcomeActionContext.jsx";
import { useState } from "react";
import { API_URL } from "../services/api.js";

export default function JoinForm() {

    const { action, setAction } = useWelcomeAction();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);

        const roomIdInput = formData.get(action === "create" ? "name-salon" : "code-salon");
        const username = (formData.get("nom-user") || "").toString().trim();

        if (!username || username.length > 30) {
            setError("Nom d'utilisateur invalide (1 à 30 caractères).");
            setLoading(false);
            return;
        }

        localStorage.setItem("username", username);

        if (action === "create") {
            try {
                const response = await fetch(`${API_URL}/api/rooms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin: username })
                });

                if (!response.ok) throw new Error("Erreur de création du salon");

                const data = await response.json();
                navigate(`/room/${data.roomId}`);
            } catch (err) {
                console.error(err);
                setError("Impossible de créer le salon.");
            }
        } else {
            const roomId = (roomIdInput || "").toString().trim();
            if (!/^[a-zA-Z0-9]{4,16}$/.test(roomId)) {
                setError("Code de salon invalide.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
                if (response.status === 404) {
                    setError("Ce salon n'existe pas.");
                    setLoading(false);
                    return;
                }

                if (!response.ok) throw new Error("Erreur serveur");

                navigate(`/room/${roomId}`);
            } catch (err) {
                console.error(err);
                setError("Erreur lors de la connexion au salon.");
            }
        }
        setLoading(false);
    }

    const join = {
        text: "Entrez le code du salon",
        button: "Rejoindre le salon",
        input: "code-salon"
    }
    const create = {
        text: "Nom du salon (Optionnel)",
        button: "Créer un salon",
        input: "name-salon"
    }



    function handleLinkClick(id) {
        setAction(id);
        setError(null);
    }



    return (
        <section className={styles.card} aria-label="Formulaire de salon">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.title}>
                    <button type="button" onClick={() => handleLinkClick("create")} className={`${styles.action} ${action === "create" ? styles.active : ""}`}>Créer un Salon</button>
                    <span className={styles.separator} aria-hidden="true"></span>
                    <button type="button" onClick={() => handleLinkClick("join")} className={`${styles.action} ${action === "join" ? styles.active : ""}`} >Rejoindre Salon</button>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                {action === "join" && (
                    <>
                        <label className="sr-only" htmlFor="code-salon">
                            {join.text}
                        </label>
                        <Input
                            id="code-salon"
                            name={join.input}
                            placeholder={join.text}
                            autoComplete="off"
                            required
                        />
                    </>
                )}
                
                {action === "create" && (
                    <p className={styles.hint}>
                        Un code unique sera généré pour votre salon.
                    </p>
                )}

                <label className="sr-only" htmlFor="nom-user">Nom d'utilisateur</label>
                <Input
                    id="nom-user"
                    name="nom-user"
                    placeholder="Entrez un nom d'utilisateur"
                    autoComplete="name"
                    required
                />
                <Checkbox id="terms" required>
                    J'accepte les
                    <a href="#" target="_blank" rel="noopener noreferrer" className={`${styles.conditions}`}
                    > conditions générales</a
                    >
                </Checkbox>
                <Button variant="primary" size="xlarge" className={`${styles.alignEnd}`} type="submit" disabled={loading}>
                    {loading ? "Chargement..." : (action === "create" ? create.button : join.button)}
                </Button>
            </form>
        </section>
    )
}