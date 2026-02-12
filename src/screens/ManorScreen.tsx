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

// Floor blueprint images
import Floor1Img from '../assets/Images/ManorFloors/1stFloor.jpg';
import Floor2Img from '../assets/Images/ManorFloors/2ndFloor.jpg';
import BasementImg from '../assets/Images/ManorFloors/Basement.jpg';

export interface Room {
    id: string;
    name: string;
    type: string;
    image: string;
    level: number;
    floor: 'basement' | '1st' | '2nd';
    // Position and size as percentages (0-100) of the blueprint
    // x, y = position from top-left corner
    // width, height = size of the room box
    x: number;
    y: number;
    width: number;
    height: number;
    description?: string;
    occupant?: string;
}

type FloorType = 'basement' | '1st' | '2nd';

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

const FLOOR_IMAGES: { [key in FloorType]: string } = {
    'basement': BasementImg,
    '1st': Floor1Img,
    '2nd': Floor2Img,
};

export const ManorScreen: FC<ManorScreenProps> = ({ stage, setScreenType }) => {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [currentFloor, setCurrentFloor] = useState<FloorType>('1st');

    // Room positions on each floor blueprint
    // Adjust x, y, width, height (all percentages 0-100) to position rooms on the blueprint
    // Look at the blueprint image and estimate where rooms should be
    // x = horizontal position from left edge
    // y = vertical position from top edge
    // width/height = size of the room box
    const getManorRooms = (): Room[] => {
        const defaultRooms: Room[] = [
            // 1st Floor rooms
            { 
                id: 'your_room', 
                name: 'Your Room', 
                type: 'your_room', 
                image: ROOM_IMAGES['your_room'], 
                level: 1, 
                floor: '1st',
                x: 15, y: 20, width: 20, height: 25,
                description: 'Your personal quarters' 
            },
            { 
                id: 'ritual', 
                name: 'Ritual Room', 
                type: 'ritual', 
                image: ROOM_IMAGES['ritual'], 
                level: 1, 
                floor: '1st',
                x: 40, y: 20, width: 20, height: 25,
                description: 'Where the magic happens' 
            },
            { 
                id: 'quarters', 
                name: 'Servant Quarters', 
                type: 'quarters', 
                image: ROOM_IMAGES['quarters'], 
                level: 1, 
                floor: '1st',
                x: 65, y: 20, width: 20, height: 25,
                description: 'Housing for your servants' 
            },
            
            // 2nd Floor rooms
            { 
                id: 'classroom', 
                name: 'Classroom', 
                type: 'classroom', 
                image: ROOM_IMAGES['classroom'], 
                level: 1, 
                floor: '2nd',
                x: 20, y: 30, width: 25, height: 20,
                description: 'Education and training' 
            },
            { 
                id: 'storage', 
                name: 'Storage', 
                type: 'storage', 
                image: ROOM_IMAGES['storage'], 
                level: 1, 
                floor: '2nd',
                x: 55, y: 30, width: 25, height: 20,
                description: 'Keep your items safe' 
            },
            
            // Basement rooms
            { 
                id: 'brewing', 
                name: 'Brewing Room', 
                type: 'brewing', 
                image: ROOM_IMAGES['brewing'], 
                level: 1, 
                floor: 'basement',
                x: 25, y: 35, width: 20, height: 25,
                description: 'Potion crafting area' 
            },
            { 
                id: 'stable', 
                name: 'Stable', 
                type: 'stable', 
                image: ROOM_IMAGES['stable'], 
                level: 1, 
                floor: 'basement',
                x: 55, y: 35, width: 20, height: 25,
                description: 'For magical creatures' 
            },
        ];

        // Add rooms from state/upgrades if needed
        const upgradeRooms = Object.entries(stage().currentState.manorUpgrades).map(([key, upgrade]) => ({
            id: key.toLowerCase(),
            name: upgrade.name,
            type: key.toLowerCase(),
            image: ROOM_IMAGES[key.toLowerCase()] || ROOM_IMAGES['quarters'],
            level: upgrade.level,
            floor: '1st' as FloorType,
            x: 50, y: 50, width: 15, height: 20,
            description: upgrade.description,
        }));

        return [...defaultRooms, ...upgradeRooms];
    };

    const rooms = getManorRooms();
    const currentFloorRooms = rooms.filter(room => room.floor === currentFloor);

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
    };

    return (
        <div className="manor-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    ← Menu
                </button>
                <h2>Manor Management</h2>
                
                {/* Floor Navigation */}
                <div className="floor-navigation">
                    <button 
                        className={`floor-button ${currentFloor === '2nd' ? 'active' : ''}`}
                        onClick={() => setCurrentFloor('2nd')}
                    >
                        2nd Floor
                    </button>
                    <button 
                        className={`floor-button ${currentFloor === '1st' ? 'active' : ''}`}
                        onClick={() => setCurrentFloor('1st')}
                    >
                        1st Floor
                    </button>
                    <button 
                        className={`floor-button ${currentFloor === 'basement' ? 'active' : ''}`}
                        onClick={() => setCurrentFloor('basement')}
                    >
                        Basement
                    </button>
                </div>
            </div>

            {/* Manor Blueprint with positioned rooms */}
            <div 
                className="manor-blueprint"
                style={{ backgroundImage: `url(${FLOOR_IMAGES[currentFloor]})` }}
            >
                {currentFloorRooms.map((room) => (
                    <div
                        key={room.id}
                        className={`room-box ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                        style={{
                            left: `${room.x}%`,
                            top: `${room.y}%`,
                            width: `${room.width}%`,
                            height: `${room.height}%`,
                        }}
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
            </div>

            {/* Room Detail Panel */}
            {selectedRoom && (
                <div className="room-detail-panel">
                    <h3>{selectedRoom.name}</h3>
                    <p>{selectedRoom.description}</p>
                    <div className="room-info">
                        <span>Floor: {selectedRoom.floor === '1st' ? '1st' : selectedRoom.floor === '2nd' ? '2nd' : 'Basement'}</span>
                    </div>
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
