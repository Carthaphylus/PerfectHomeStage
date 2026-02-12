import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

// Room images
import BrewingImg from '../assets/Images/Rooms/Brewing.webp';
import ClassroomImg from '../assets/Images/Rooms/Classroom.webp';
import OvenImg from '../assets/Images/Rooms/Oven.webp';
import QuartersImg from '../assets/Images/Rooms/Quarters.webp';
import RitualImg from '../assets/Images/Rooms/Ritual_room.webp';
import StableImg from '../assets/Images/Rooms/Stable.webp';
import StorageImg from '../assets/Images/Rooms/Storage_closet.webp';
import YourRoomImg from '../assets/Images/Rooms/Your_Room.webp';

export interface Room {
    id: string;
    name: string;
    type: string;
    image: string;
    level: number;
    description?: string;
    occupant?: string;
}

interface ManorScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

const ROOM_IMAGES: { [key: string]: string } = {
    'brewing': BrewingImg,
    'classroom': ClassroomImg,
    'kitchen': OvenImg,
    'quarters': QuartersImg,
    'ritual': RitualImg,
    'stable': StableImg,
    'storage': StorageImg,
    'your_room': YourRoomImg,
};

export const ManorScreen: FC<ManorScreenProps> = ({ stage, setScreenType }) => {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Get rooms from manor upgrades or default rooms
    const getManorRooms = (): Room[] => {
        const defaultRooms: Room[] = [
            { id: 'your_room', name: 'Your Room', type: 'your_room', image: ROOM_IMAGES['your_room'], level: 1, description: 'Your personal quarters' },
            { id: 'ritual', name: 'Ritual Room', type: 'ritual', image: ROOM_IMAGES['ritual'], level: 1, description: 'Where the magic happens' },
            { id: 'quarters', name: 'Servant Quarters', type: 'quarters', image: ROOM_IMAGES['quarters'], level: 1, description: 'Housing for your servants' },
        ];

        // Add rooms from upgrades
        const upgradeRooms = Object.entries(stage().currentState.manorUpgrades).map(([key, upgrade]) => ({
            id: key.toLowerCase(),
            name: upgrade.name,
            type: key.toLowerCase(),
            image: ROOM_IMAGES[key.toLowerCase()] || ROOM_IMAGES['quarters'],
            level: upgrade.level,
            description: upgrade.description,
        }));

        return [...defaultRooms, ...upgradeRooms];
    };

    const rooms = getManorRooms();

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
        // Could trigger a skit here
        // setScreenType(ScreenType.SKIT);
    };

    return (
        <div className="manor-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    ← Menu
                </button>
                <h2>Manor Management</h2>
                <div className="header-spacer"></div>
            </div>

            {/* Manor Grid */}
            <div className="manor-grid">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                        onClick={() => handleRoomClick(room)}
                    >
                        <div
                            className="room-image"
                            style={{ backgroundImage: `url(${room.image})` }}
                        >
                            <div className="room-overlay">
                                <div className="room-name">{room.name}</div>
                                <div className="room-level">Lv. {room.level}</div>
                            </div>
                        </div>
                        {room.occupant && (
                            <div className="room-occupant">👤 {room.occupant}</div>
                        )}
                    </div>
                ))}

                {/* Empty slots for expansion */}
                <div className="room-card empty-slot">
                    <div className="empty-slot-content">
                        <div className="plus-icon">+</div>
                        <div className="empty-text">Build Room</div>
                    </div>
                </div>
            </div>

            {/* Room Detail Panel */}
            {selectedRoom && (
                <div className="room-detail-panel">
                    <h3>{selectedRoom.name}</h3>
                    <p>{selectedRoom.description}</p>
                    <div className="room-actions">
                        <button className="action-button">⬆️ Upgrade</button>
                        <button className="action-button">🎭 Enter</button>
                        <button className="action-button">🗑️ Remove</button>
                    </div>
                </div>
            )}
        </div>
    );
};
