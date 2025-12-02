import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    restrictToVerticalAxis,
    restrictToParentElement
} from '@dnd-kit/modifiers';


import styles from './Playlist.module.css';
import Card from "../component/ui/Card.jsx"; // Vérifie tes chemins
import PlaylistItem from "../component/ui/PlaylistItem.jsx";
import {usePlaylist} from "../context/HomePlaylistContext.jsx"; // Vérifie tes chemins

/* ------------------------------------------------------------
   LE WRAPPER (Le pont entre DND-Kit et ton UI)
   C'est lui qui rend ton PlaylistItem "intelligent"
------------------------------------------------------------ */
function SortablePlaylistItem({ item }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1, // Petit effet visuel quand on traîne
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' // Important pour le z-index
    };

    return (
        <div ref={setNodeRef} style={style}>
            <PlaylistItem
                item={item}
                // Il extrait les listeners (click/drag) et attributes (aria) de dnd-kit
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

/* ------------------------------------------------------------
   LE COMPOSANT PRINCIPAL
------------------------------------------------------------ */
export default function Playlist() {
    const {items, setItems} = usePlaylist();

    // Configuration des capteurs (Souris, Tactile, Clavier)
    // PointerSensor est mieux que MouseSensor (marche sur mobile aussi)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                // Fonction utilitaire magique de dnd-kit
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <Card title="Playlist" iconName="menu">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <ul className={styles.list}>
                        {items.map((item) => (
                            <SortablePlaylistItem key={item.id} item={item} />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </Card>
    );
}