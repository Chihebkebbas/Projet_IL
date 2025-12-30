import { HomePlaylistProvider } from "./context/HomePlaylistContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import { WelcomeActionProvider } from "./context/WelcomeActionContext.jsx";
import { Routes, Route } from 'react-router-dom';
import WelcomePage from "./pages/WelcomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
    return (
        <WelcomeActionProvider>
            <HomePlaylistProvider>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/room" element={<HomePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </HomePlaylistProvider>
        </WelcomeActionProvider>
    )
}

export default App