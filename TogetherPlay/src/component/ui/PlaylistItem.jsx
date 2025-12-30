import styles from './PlaylistItem.module.css'
import Button from "./Button.jsx";
import { usePlaylist } from "../../context/HomePlaylistContext.jsx";

// 1. On ajoute la prop 'dragHandleProps'
export default function PlaylistItem({ item, dragHandleProps }) {

    const { items, setItems, playVideo } = usePlaylist();

    function handleRemoveItem(id) {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
    }

    return (
        <li className={styles.item} role="listitem" onClick={() => playVideo(item)} style={{ cursor: 'pointer' }}>
            {/* 2. On applique les props magiques (listeners, attributes) sur le bouton poignée */}
            <Button
                type="button"
                variant="ghost"
                size="default" // Assure-toi que 'default' ou 'iconOnly' correspond bien à un bouton carré dans ton CSS
                iconName="drag_indicator"
                iconHover="red"
                ariaLabel="Déplacer la vidéo"
                /* C'est ICI que la magie opère : le bouton reçoit les événements de dnd-kit */
                {...dragHandleProps}
                onClick={(e) => e.stopPropagation()}
            />

            <img
                src={item.thumbnail}
                alt="Miniature de la vidéo"
                className={styles.thumbnail}
            />

            <p className={styles.title}>
                {item.title}
            </p>

            <Button
                type="button"
                variant="ghost"
                size="default"
                iconName="close"
                iconHover="red"
                ariaLabel="Retirer de la playlist"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                }}
            />
        </li>
    )
}