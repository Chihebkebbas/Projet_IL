import { HomePlaylistProvider } from "./context/HomePlaylistContext.jsx";
import HomePage from "./pages/HomePage.jsx";
// import WelcomePage from "./pages/WelcomePage.jsx"; // On commente temporairement

function App() {
    return (
        <HomePlaylistProvider>
            {/* <WelcomePage />  <-- On cache ça pour le moment */}
            <HomePage />      {/* <-- On affiche ça pour tester */}
        </HomePlaylistProvider>
    )
}

export default App