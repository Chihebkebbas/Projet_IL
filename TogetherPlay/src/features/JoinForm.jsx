import Input from "../component/ui/Input.jsx";
import Checkbox from "../component/ui/Checkbox.jsx";
import Button from "../component/ui/Button.jsx";
import styles from "./JoinForm.module.css";
import { useNavigate } from "react-router-dom";
import { useWelcomeAction } from "../context/WelcomeActionContext.jsx";
import { useState } from "react";

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
        // "code-salon" is used for both Create and Join based on input names below
        const roomIdInput = formData.get(action === "create" ? "name-salon" : "code-salon");
        const username = formData.get("nom-user");

        // Save username locally for now (could be passed via context, simpler with storage)
        localStorage.setItem("username", username);

        if (action === "create") {
            try {
                // Call Create Room API
                const response = await fetch('http://localhost:3001/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error("Erreur de création du salon");

                const data = await response.json();
                navigate(`/room/${data.roomId}`);
            } catch (err) {
                console.error(err);
                setError("Impossible de créer le salon.");
            }
        } else {
            // Join Room
            const roomId = roomIdInput.trim();
            if (!roomId) {
                setError("Veuillez entrer un ID de salon.");
                setLoading(false);
                return;
            }

            try {
                // Check if room exists
                const response = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
                if (response.status === 404) {
                    setError("Ce salon n'existe pas.");
                    setLoading(false);
                    return;
                }

                if (!response.ok) throw new Error("Erreur serveur");

                // Navigate to room
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

                {error && <p style={{ color: 'var(--primary-red)', marginBottom: '10px' }}>{error}</p>}

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
                {/* Pour "Créer", on n'a pas forcément besoin d'input nom de salon si on génère l'ID,
                     mais on peut le garder pour le décor ou futur usage.
                     Note : Le backend génère l'ID quoi qu'il arrive pour l'instant.
                 */}
                {action === "create" && (
                    <div style={{ marginBottom: '1rem', color: 'var(--base200)', fontStyle: 'italic' }}>
                        Un code unique sera généré pour votre salon.
                    </div>
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