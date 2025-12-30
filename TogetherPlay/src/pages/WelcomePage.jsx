import Header from "../component/layout/Header.jsx";
import JoinForm from "../features/JoinForm.jsx";
import Footer from "../component/layout/Footer.jsx";
import styles from './WelcomePage.module.css';
import {useState} from "react";
import {WelcomeActionProvider} from "../context/WelcomeActionContext.jsx";


export default function WelcomePage() {


    return(
        <WelcomeActionProvider >
                <Header />
                <main className={styles.main}>
                    <h1 className={styles.title}>Regardez vos vidéos ensemble, en temps réel.</h1>
                    <p className={styles.subtitle}>
                        Créez un salon privé et invitez vos amis à regarder, discuter et
                        partager vos vidéos préférées.
                    </p>
                    <JoinForm />
                    <Footer />
                </main>
        </WelcomeActionProvider>

    )
}