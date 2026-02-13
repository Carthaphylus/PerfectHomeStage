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
import EmptyRoomImg from '../assets/Images/Rooms/Empty.jpeg';

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
    const [emptyRoomIds, setEmptyRoomIds] = useState<Set<string>>(new Set());
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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
                x: 17, y: 30.5, width: 22, height: 15,
                description: 'Your personal quarters' 
            },
            { 
                id: 'ritual', 
                name: 'Ritual Room', 
                type: 'ritual', 
                image: ROOM_IMAGES['ritual'], 
                level: 1, 
                floor: '1st',
                x: 10, y: 20, width: 2, height: 2,
                description: 'Where the magic happens' 
            },
            { 
                id: 'quarters', 
                name: 'Servant Quarters', 
                type: 'quarters', 
                image: ROOM_IMAGES['quarters'], 
                level: 1, 
                floor: '1st',
                x: 60, y: 30, width: 35, height: 15,
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
            
            // Empty room template - Copy this to add more rooms to your layout
            { 
                id: 'empty_room_1', 
                name: 'Empty Room', 
                type: 'empty', 
                image: EmptyRoomImg, 
                level: 0, 
                floor: '1st',
                x: 10, y: 58, width: 24, height: 22,
                description: 'An empty room awaiting construction' 
            },

            { 
                id: 'empty_room_2', 
                name: 'Empty Room2', 
                type: 'empty', 
                image: EmptyRoomImg, 
                level: 0, 
                floor: '1st',
                x: 65, y: 58, width: 24, height: 22,
                description: 'An empty room awaiting construction' 
            },

            { 
                id: 'empty_room_3', 
                name: 'Empty Room3', 
                type: 'empty', 
                image: EmptyRoomImg, 
                level: 0, 
                floor: '1st',
                x: 65, y: 15.5, width: 18, height: 13,
                description: 'An empty room awaiting construction' 
            },
        ];

        // Commented out - manually define all rooms above instead of pulling from state
        // const upgradeRooms = Object.entries(stage().currentState.manorUpgrades).map(([key, upgrade]) => ({
        //     id: key.toLowerCase(),
        //     name: upgrade.name,
        //     type: key.toLowerCase(),
        //     image: ROOM_IMAGES[key.toLowerCase()] || ROOM_IMAGES['quarters'],
        //     level: upgrade.level,
        //     floor: '1st' as FloorType,
        //     x: 50, y: 50, width: 15, height: 20,
        //     description: upgrade.description,
        // }));

        return defaultRooms;
        // return [...defaultRooms, ...upgradeRooms];
    };

    const rooms = getManorRooms();
    const currentFloorRooms = rooms.filter(room => room.floor === currentFloor);

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
    };
    
    const handleRemoveRoom = () => {
        if (selectedRoom) {
            setEmptyRoomIds(prev => new Set(prev).add(selectedRoom.id));
            setShowRemoveConfirm(false);
            // Keep the room selected to show it's now empty
        }
    };
    
    const isRoomEmpty = (roomId: string) => {
        // Check if room was removed (in emptyRoomIds set)
        if (emptyRoomIds.has(roomId)) return true;
        
        // Check if room is defined as empty (type 'empty' or level 0)
        const room = rooms.find(r => r.id === roomId);
        return room ? (room.type === 'empty' || room.level === 0) : false;
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

            <div className="manor-content">
                {/* Left Side - Manor Overview */}
                <div className="manor-info-panel">
                    <h3>Manor Overview</h3>
                    
                    <div className="info-section">
                        <div className="info-label">Current Floor</div>
                        <div className="info-value">
                            {currentFloor === '1st' ? '1st Floor' : currentFloor === '2nd' ? '2nd Floor' : 'Basement'}
                        </div>
                    </div>
                    
                    <div className="info-section">
                        <div className="info-label">Total Rooms</div>
                        <div className="info-value">{rooms.length}</div>
                    </div>
                    
                    <div className="info-section">
                        <div className="info-label">Rooms on Floor</div>
                        <div className="info-value">{currentFloorRooms.length}</div>
                    </div>
                    
                    <div className="info-divider"></div>
                    
                    <h4>Floor Summary</h4>
                    <div className="floor-rooms-list">
                        {currentFloorRooms.map((room) => (
                            <div 
                                key={room.id} 
                                className={`room-list-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                                onClick={() => handleRoomClick(room)}
                            >
                                <span className="room-list-name">{room.name}</span>
                                <span className="room-list-level">Lv.{room.level}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="info-divider"></div>
                    
                    <div className="floor-quick-nav">
                        <div className="quick-nav-label">Quick Floor Switch</div>
                        <div className="quick-nav-buttons">
                            <button 
                                className={`quick-nav-btn ${currentFloor === 'basement' ? 'active' : ''}`}
                                onClick={() => setCurrentFloor('basement')}
                            >
                                B
                            </button>
                            <button 
                                className={`quick-nav-btn ${currentFloor === '1st' ? 'active' : ''}`}
                                onClick={() => setCurrentFloor('1st')}
                            >
                                1F
                            </button>
                            <button 
                                className={`quick-nav-btn ${currentFloor === '2nd' ? 'active' : ''}`}
                                onClick={() => setCurrentFloor('2nd')}
                            >
                                2F
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center - Manor Blueprint with positioned rooms */}
                <div 
                    className="manor-blueprint"
                    style={{ backgroundImage: `url(${FLOOR_IMAGES[currentFloor]})` }}
                >
                    {currentFloorRooms.map((room) => (
                        <div
                            key={room.id}
                            className={`room-box ${selectedRoom?.id === room.id ? 'selected' : ''} ${isRoomEmpty(room.id) ? 'empty-room' : ''}`}
                            style={{
                                left: `${room.x}%`,
                                top: `${room.y}%`,
                                width: `${room.width}%`,
                                height: `${room.height}%`,
                            }}
                            onClick={() => handleRoomClick(room)}
                        >
                            {isRoomEmpty(room.id) ? (
                                <div
                                    className="room-image empty-room-image"
                                    style={{ backgroundImage: `url(${EmptyRoomImg})` }}
                                >
                                    <div className="room-overlay">
                                        <div className="room-name">Empty Room</div>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Side - Room Detail Panel */}
                <div className={`room-detail-panel ${selectedRoom ? 'visible' : ''}`}>
                    {selectedRoom ? (
                        <>
                            {isRoomEmpty(selectedRoom.id) ? (
                                <>
                                    <div className="room-detail-header">
                                        <h3>Empty Room</h3>
                                        <span className="room-type-badge empty">vacant</span>
                                    </div>
                                    
                                    <div className="room-preview-image" style={{ backgroundImage: `url(${EmptyRoomImg})` }}></div>
                                    
                                    <div className="room-detail-content">
                                        <p className="room-description">This room has been cleared and is now available for reconstruction.</p>
                                        
                                        <div className="room-stats">
                                            <div className="stat-row">
                                                <span className="stat-label">📍 Location:</span>
                                                <span className="stat-value">
                                                    {selectedRoom.floor === '1st' ? '1st Floor' : selectedRoom.floor === '2nd' ? '2nd Floor' : 'Basement'}
                                                </span>
                                            </div>
                                            <div className="stat-row">
                                                <span className="stat-label">📐 Size:</span>
                                                <span className="stat-value">{selectedRoom.width}% × {selectedRoom.height}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="room-effects">
                                            <h4>Available Actions</h4>
                                            <div className="effect-item">
                                                <span className="effect-icon">🏗️</span>
                                                <span className="effect-text">Build a new room</span>
                                            </div>
                                            <div className="effect-item">
                                                <span className="effect-icon">🎨</span>
                                                <span className="effect-text">Renovate the space</span>
                                            </div>
                                            <div className="effect-item">
                                                <span className="effect-icon">📏</span>
                                                <span className="effect-text">Redesign layout</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="room-actions">
                                        <button className="action-button primary">🏗️ Build Room</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="room-detail-header">
                                        <h3>{selectedRoom.name}</h3>
                                        <span className="room-type-badge">{selectedRoom.type.replace('_', ' ')}</span>
                                    </div>
                                    
                                    <div className="room-preview-image" style={{ backgroundImage: `url(${selectedRoom.image})` }}></div>
                                    
                                    <div className="room-detail-content">
                                        <p className="room-description">{selectedRoom.description}</p>
                                        
                                        <div className="room-stats">
                                            <div className="stat-row">
                                                <span className="stat-label">📍 Location:</span>
                                                <span className="stat-value">
                                                    {selectedRoom.floor === '1st' ? '1st Floor' : selectedRoom.floor === '2nd' ? '2nd Floor' : 'Basement'}
                                                </span>
                                            </div>
                                            <div className="stat-row">
                                                <span className="stat-label">⭐ Level:</span>
                                                <span className="stat-value">{selectedRoom.level}</span>
                                            </div>
                                            {selectedRoom.occupant && (
                                                <div className="stat-row">
                                                    <span className="stat-label">👤 Occupant:</span>
                                                    <span className="stat-value">{selectedRoom.occupant}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="room-effects">
                                            <h4>Room Effects</h4>
                                            <div className="effect-item">
                                                <span className="effect-icon">✨</span>
                                                <span className="effect-text">Provides comfort and rest</span>
                                            </div>
                                            <div className="effect-item">
                                                <span className="effect-icon">💰</span>
                                                <span className="effect-text">Generates +{selectedRoom.level * 10} income/day</span>
                                            </div>
                                            <div className="effect-item">
                                                <span className="effect-icon">📈</span>
                                                <span className="effect-text">+{selectedRoom.level * 5}% efficiency bonus</span>
                                            </div>
                                        </div>
                                        
                                        <div className="upgrade-info">
                                            <h4>Next Upgrade</h4>
                                            <div className="upgrade-cost">
                                                <span>💎 Cost: {selectedRoom.level * 500} Gold</span>
                                            </div>
                                            <div className="upgrade-benefit">
                                                <span>Unlocks: Enhanced functions</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="room-actions">
                                        <button className="action-button primary">⬆️ Upgrade</button>
                                        <button className="action-button">🎭 Enter</button>
                                        <button 
                                            className="action-button danger" 
                                            onClick={() => setShowRemoveConfirm(true)}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="no-room-selected">
                            <div className="placeholder-icon">🏠</div>
                            <p>Select a room to view details</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Confirmation Dialog */}
            {showRemoveConfirm && selectedRoom && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h3>⚠️ Remove Room?</h3>
                        <p>Are you sure you want to remove <strong>{selectedRoom.name}</strong>?</p>
                        <p className="warning-text">The room will be cleared and converted to an empty space.</p>
                        
                        <div className="confirmation-actions">
                            <button 
                                className="confirm-button cancel"
                                onClick={() => setShowRemoveConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-button confirm"
                                onClick={handleRemoveRoom}
                            >
                                Remove Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
