import Input from "../component/ui/Input.jsx";
import Checkbox from "../component/ui/Checkbox.jsx";
import Button from "../component/ui/Button.jsx";
import styles from "./JoinForm.module.css";
import {act, useContext, useState} from "react";
import {useWelcomeAction} from "../context/WelcomeActionContext.jsx";

export default function JoinForm() {

    const {action, setAction} = useWelcomeAction();

    const join = {
        text: "Entrez le code du salon",
        button: "Rejoindre le salon",
        input: "code-salon"
    }
    const create = {
        text: "Entrez le nom du salon",
        button: "Créer un salon",
        input: "name-salon"
    }



    function handleLinkClick(id) {
        setAction(id);
    }



    return (
        <section className={styles.card} aria-label="Formulaire de salon">
            <form action="#" method="post" noValidate className={styles.form}>
                <div className={styles.title}>
                    <button type="button" onClick={()=> handleLinkClick("create")} className={`${styles.action} ${action === "create" ? styles.active : ""}`}>Créer un Salon</button>
                    <span className={styles.separator} aria-hidden="true"></span>
                    <button type="button" onClick={() => handleLinkClick("join")} className={`${styles.action} ${action === "join" ? styles.active : ""}`} >Rejoindre Salon</button>
                </div>
                <label className="sr-only" htmlFor="code-salon">
                    {action === "create" ? create.name : join.name}
                </label>
                <Input
                    id="code-salon"
                    name= {action === "create" ? create.input : join.input}
                    placeholder= {action === "create" ? create.text : join.text}
                    autoComplete="one-time-code"
                    required
                />
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
                <Button variant="primary" size="xlarge" className={`${styles.alignEnd}`} type="submit">
                    {action === "create" ? create.button : join.button}
                </Button>
            </form>
        </section>
    )
}