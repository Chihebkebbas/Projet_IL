import {createContext, useState, useContext} from "react";

const WelcomeActionContext = createContext(undefined);

export function WelcomeActionProvider ({ children }){
    const [action, setAction] = useState("join");

    return (
        <WelcomeActionContext.Provider value={{ action, setAction }}>
            {children}
        </WelcomeActionContext.Provider>
    )

}

// Hook personalisé (Custom Hook) pour ré-utiliser la logique
export function useWelcomeAction() {
    const context = useContext(WelcomeActionContext);
    if (!context) {
        throw new Error("useWelcomeAction doit être utilisé à l'intérieur de WelcomeActionProvider");
    }
    return context;
}