import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Message from "./component/ui/Message.jsx";

import './assets/style/home.css'
import Chat from "./features/Chat.jsx";
import SuggestionItem from "./component/ui/SuggestionItem.jsx";
import SuggestionsGrid from "./features/SuggestionsGrid.jsx";

createRoot(document.getElementById('root')).render(
    <>
        <App />
    </>


)