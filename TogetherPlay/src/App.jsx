import { useState } from 'react'
import Button from "./component/ui/Button.jsx";
import Input from "./component/ui/Input.jsx";
import JoinForm from "./features/JoinForm.jsx";
import {WelcomeActionProvider} from "./context/WelcomeActionContext.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import Playlist from "./features/Playlist.jsx";
import PlaylistItem from "./component/ui/PlaylistItem.jsx";
import Header from "./component/layout/Header.jsx";
import {HomePlaylistProvider} from "./context/HomePlaylistContext.jsx";

function App() {
  return (

        <>
            <HomePlaylistProvider >
                <Playlist />
            </HomePlaylistProvider>
        </>


  )
}

export default App
