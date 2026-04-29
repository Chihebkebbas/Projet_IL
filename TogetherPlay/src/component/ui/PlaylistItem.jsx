import styles from './PlaylistItem.module.css';
import Button from "./Button.jsx";
import { usePlaylist } from "../../context/HomePlaylistContext.jsx";

export default function PlaylistItem({ item, dragHandleProps }) {
    const { removeItem, playVideo, isAdmin } = usePlaylist();

    function handleRemoveItem(id) {
        removeItem(id);
    }

    function handleClick() {
        playVideo(item);
    }

    return (
        <li className={styles.item} role="listitem" onClick={handleClick}>
            <Button
                type="button"
                variant="ghost"
                size="default"
                iconName="drag_indicator"
                iconHover="red"
                ariaLabel="Déplacer la vidéo"
                {...dragHandleProps}
                onClick={(e) => e.stopPropagation()}
            />

            <img
                src={item.thumbnail}
                alt="Miniature de la vidéo"
                className={styles.thumbnail}
            />

            <p className={styles.title}>{item.title}</p>

            {isAdmin && (
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
            )}
        </li>
    );
}
