import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

// Room images
import BrewingImg from '../assets/Images/Rooms/Brewing.webp';
import ClassroomImg from '../assets/Images/Rooms/classroom.jpg';
import OvenImg from '../assets/Images/Rooms/Oven.webp';
import QuartersImg from '../assets/Images/Rooms/servantquarters.jpg';
import RitualImg from '../assets/Images/Rooms/Ritual_room.webp';
import StableImg from '../assets/Images/Rooms/Stable.webp';
import StorageImg from '../assets/Images/Rooms/storage.jpg';
import YourRoomImg from '../assets/Images/Rooms/Your_Room.webp';
import CorridorImg from '../assets/Images/Rooms/corridor.jpg';
import DungeonImg from '../assets/Images/Rooms/dungeon.jpg';
import CellImg from '../assets/Images/Rooms/cell.jpg';
import EmptyRoomImg from '../assets/Images/Rooms/Empty.jpeg';
// TODO: import KitchenImg from '../assets/Images/Rooms/kitchen.jpg'; (when provided)
// TODO: import LoungeImg from '../assets/Images/Rooms/lounge.jpg'; (when provided)

// Floor blueprint images
import Floor1Img from '../assets/Images/ManorFloors/1stFloor.jpg';
import Floor2Img from '../assets/Images/ManorFloors/2ndFloor.jpg';
import BasementImg from '../assets/Images/ManorFloors/Basement.jpg';

// Background images
import GrassBackgroundImg from '../assets/Images/BackGround/grass.jpg';
import PlankBackgroundImg from '../assets/Images/BackGround/plank.jpg';

// ============================================================================
// ROOM CLASS SYSTEM
// ============================================================================
// 
// HOW TO USE:
// 1. Each room type is a class extending BaseRoom
// 2. Each class can have its own custom methods and properties
// 3. To create a new room type:
//    - Create a new class extending BaseRoom (e.g., class LibraryClass extends BaseRoom)
//    - Set name, type, image, description in constructor
//    - Add the room type to the createRoom() factory function
//    - Add roomType to a slot in getRoomSlots()
// 4. To add room-specific functionality:
//    - Override methods like onEnter(), onUpgrade(), etc.
//    - Add custom methods to specific room classes
// 
// EXAMPLE:
// class LibraryClass extends BaseRoom {
//     booksStored: number = 0;
//     
//     constructor(...) {
//         super(...);
//         this.name = 'Library';
//         this.type = 'library';
//         this.image = LibraryImg;
//     }
//     
//     onEnter(): void {
//         console.log(`Entering library with ${this.booksStored} books`);
//     }
// }
// ============================================================================

type FloorType = 'basement' | '1st' | '2nd' | 'outside';

// Base Room class - all rooms extend from this
// Only contains room-specific properties, not slot/position data
export abstract class BaseRoom {
    name: string;
    type: string;
    image: string;
    description: string;
    level: number;
    occupant?: string;

    constructor(
        level: number = 1,
        occupant?: string
    ) {
        this.level = level;
        this.occupant = occupant;
        
        // Set defaults - subclasses will override
        this.name = 'Room';
        this.type = 'room';
        this.image = EmptyRoomImg;
        this.description = 'A room in the manor';
    }

    // Methods that can be overridden by specific room types
    onEnter(): void {
        console.log(`Entering ${this.name}`);
    }

    onUpgrade(): void {
        this.level += 1;
        console.log(`${this.name} upgraded to level ${this.level}`);
    }

    getUpgradeCost(): number {
        return this.level * 500;
    }

    getIncomePerDay(): number {
        return this.level * 10;
    }

    getEfficiencyBonus(): number {
        return this.level * 5;
    }
}

// Specific room type classes - only define room properties, not position
class YourRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Your Room';
        this.type = 'your_room';
        this.image = YourRoomImg;
        this.description = 'Your personal quarters';
    }
}

class RitualRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Ritual Room';
        this.type = 'ritual';
        this.image = RitualImg;
        this.description = 'Where the magic happens';
    }
}

class QuartersClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Servant Quarters';
        this.type = 'quarters';
        this.image = QuartersImg;
        this.description = 'Housing for your servants';
    }
}

class ClassroomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Classroom';
        this.type = 'classroom';
        this.image = ClassroomImg;
        this.description = 'Education and training';
    }
}

class StorageClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Storage';
        this.type = 'storage';
        this.image = StorageImg;
        this.description = 'Keep your items safe';
    }
}

class KitchenClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Kitchen';
        this.type = 'kitchen';
        this.image = OvenImg;
        this.description = 'Where meals are prepared for the manor';
    }
}

class LoungeClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Lounge';
        this.type = 'lounge';
        this.image = QuartersImg; // Placeholder
        this.description = 'A comfortable space for relaxation and socializing';
    }
}

class CorridorClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Corridor';
        this.type = 'corridor';
        this.image = CorridorImg;
        this.description = 'A long hallway connecting the rooms';
    }
}

class BrewingRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Brewing Room';
        this.type = 'brewing';
        this.image = BrewingImg;
        this.description = 'Potion crafting area';
    }
}

class StableClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Stable';
        this.type = 'stable';
        this.image = StableImg;
        this.description = 'For magical creatures';
    }
}

class DungeonClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Dungeon';
        this.type = 'dungeon';
        this.image = DungeonImg;
        this.description = 'A dark chamber for interrogation and training';
    }
}

class CellClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Cell';
        this.type = 'cell';
        this.image = CellImg;
        this.description = 'A holding cell for captives';
    }
}

class EmptyRoomClass extends BaseRoom {
    constructor() {
        super(0);
        this.name = 'Empty Room';
        this.type = 'empty';
        this.image = EmptyRoomImg;
        this.description = 'An empty room awaiting construction';
    }
}

// Factory function to create room instances
function createRoom(
    roomType: string | null,
    level: number = 1,
    occupant?: string
): BaseRoom {
    if (!roomType) {
        return new EmptyRoomClass();
    }

    switch (roomType) {
        case 'your_room':
            return new YourRoomClass(level, occupant);
        case 'ritual':
            return new RitualRoomClass(level, occupant);
        case 'quarters':
            return new QuartersClass(level, occupant);
        case 'classroom':
            return new ClassroomClass(level, occupant);
        case 'storage':
            return new StorageClass(level, occupant);
        case 'kitchen':
            return new KitchenClass(level, occupant);
        case 'lounge':
            return new LoungeClass(level, occupant);
        case 'corridor':
            return new CorridorClass(level, occupant);
        case 'brewing':
            return new BrewingRoomClass(level, occupant);
        case 'stable':
            return new StableClass(level, occupant);
        case 'dungeon':
            return new DungeonClass(level, occupant);
        case 'cell':
            return new CellClass(level, occupant);
        default:
            return new EmptyRoomClass();
    }
}

// ============================================================================
// SLOT SYSTEM
// ============================================================================

// Slot represents a physical space in the manor
interface RoomSlot {
    slotId: string;
    floor: FloorType;
    x: number; // Position as percentage (0-100)
    y: number; // Position as percentage (0-100)
    width: number; // Size as percentage (0-100)
    height: number; // Size as percentage (0-100)
    roomType: string | null; // null means empty
    level?: number;
    occupant?: string;
}

// Combined slot + room data for rendering
interface SlotWithRoom extends RoomSlot {
    room: BaseRoom;
}

interface ManorScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

const FLOOR_IMAGES: { [key in FloorType]: string } = {
    'basement': BasementImg,
    '1st': Floor1Img,
    '2nd': Floor2Img,
    'outside': EmptyRoomImg, // Placeholder for outside
};

const BACKGROUND_IMAGES: { [key in FloorType]: string } = {
    'basement': PlankBackgroundImg,
    '1st': PlankBackgroundImg,
    '2nd': PlankBackgroundImg,
    'outside': GrassBackgroundImg,
};

export const ManorScreen: FC<ManorScreenProps> = ({ stage, setScreenType }) => {
    const [selectedRoom, setSelectedRoom] = useState<BaseRoom | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<SlotWithRoom | null>(null);
    const [currentFloor, setCurrentFloor] = useState<FloorType>('1st');
    const [emptyRoomIds, setEmptyRoomIds] = useState<Set<string>>(new Set());
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const blueprintContainerRef = useRef<HTMLDivElement>(null);

    // SLOT-BASED ROOM SYSTEM:
    // - Each floor has slots (fixed positions/sizes)
    // - Each slot can have a roomType assigned (or null for empty)
    // - Slots have unique IDs (e.g., '1st_slot_1') preventing duplication
    // - To add a room: set roomType in getRoomSlots()
    // - To make empty: set roomType to null
    // - Rooms are now class instances with their own methods
    
    // Define room slots for each floor
    // Each slot has a position and can be assigned a room type (or null for empty)
    const getRoomSlots = (): RoomSlot[] => {
        return [
            // 1st Floor slots
            { slotId: '1st_slot_1', floor: '1st', x: 1,    y: 21, width: 45, height: 22, roomType: 'your_room', level: 1 },
            { slotId: '1st_slot_2', floor: '1st', x: 2,    y: 47, width: 95, height: 15, roomType: 'corridor',  level: 1 },
            { slotId: '1st_slot_3', floor: '1st', x: 34.5, y: 67, width: 30, height: 30, roomType: 'ritual',    level: 1 },
            { slotId: '1st_slot_4', floor: '1st', x: 50,   y: 21, width: 45, height: 22, roomType: 'quarters',  level: 1 },
            { slotId: '1st_slot_5', floor: '1st', x: 2,    y: 67, width: 30, height: 30, roomType: null }, // empty
            { slotId: '1st_slot_6', floor: '1st', x: 67,   y: 67, width: 30, height: 30, roomType: null }, // empty
            { slotId: '1st_slot_7', floor: '1st', x: 66,   y: 1,  width: 30, height: 18, roomType: null }, // empty
            { slotId: '1st_slot_8', floor: '1st', x: 1,    y: 1,  width: 30, height: 18, roomType: null }, // empty
            { slotId: '1st_slot_9', floor: '1st', x: 33,   y: 1,  width: 30, height: 18, roomType: null }, // empty
            
            // 2nd Floor slots
            { slotId: '2nd_slot_1', floor: '2nd', x: 45,  y: 23, width: 50, height: 20, roomType: 'classroom', level: 1 },
            { slotId: '2nd_slot_2', floor: '2nd', x: 75,  y: 1,  width: 20, height: 20, roomType: 'storage',   level: 1 },
            { slotId: '2nd_slot_3', floor: '2nd', x: 67,  y: 66, width: 30, height: 30, roomType: 'kitchen',   level: 1 },
            { slotId: '2nd_slot_4', floor: '2nd', x: 2,   y: 66, width: 60, height: 30, roomType: 'lounge',    level: 1 },
            { slotId: '2nd_slot_5', floor: '2nd', x: 31,  y: 1,  width: 35, height: 20, roomType:  null }, // empty
            { slotId: '2nd_slot_6', floor: '2nd', x: 2,   y: 47, width: 95, height: 15, roomType: 'corridor',  level: 1 },
            { slotId: '2nd_slot_7', floor: '2nd', x: 2,   y: 1,  width: 25, height: 20, roomType: 'brewing',   level: 1 },
            { slotId: '2nd_slot_8', floor: '2nd', x: 2,   y: 23, width: 40, height: 20, roomType:  null }, // empty
            
            // Basement slots
            { slotId: 'basement_slot_1', floor: 'basement', x: 21,   y: 51, width: 55, height: 25, roomType: 'dungeon', level: 1 },
            { slotId: 'basement_slot_2', floor: 'basement', x: 22,   y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
            { slotId: 'basement_slot_3', floor: 'basement', x: 41,   y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
            { slotId: 'basement_slot_4', floor: 'basement', x: 60,   y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
            
            // Outside slots
            { slotId: 'outside_slot_1', floor: 'outside', x: 1, y: 74, width: 35, height: 25, roomType: 'stable', level: 1 },
        ];
    };

    // Convert slots to SlotWithRoom (combines slot position with room instance)
    const getSlotsWithRooms = (): SlotWithRoom[] => {
        const slots = getRoomSlots();
        
        return slots.map((slot) => {
            const roomType = emptyRoomIds.has(slot.slotId) ? null : slot.roomType;
            const room = createRoom(roomType, slot.level || 1, slot.occupant);
            
            return {
                ...slot,
                room
            };
        });
    };

    const slotsWithRooms = getSlotsWithRooms();
    const currentFloorSlots = slotsWithRooms.filter(slot => slot.floor === currentFloor);

    const handleRoomClick = (slotWithRoom: SlotWithRoom) => {
        setSelectedRoom(slotWithRoom.room);
        setSelectedSlot(slotWithRoom);
    };
    
    const handleRemoveRoom = () => {
        if (selectedSlot) {
            setEmptyRoomIds(prev => new Set(prev).add(selectedSlot.slotId));
            setShowRemoveConfirm(false);
            // Keep the room selected to show it's now empty
        }
    };
    
    const isRoomEmpty = (slotId: string, room: BaseRoom) => {
        // Check if room slot was emptied (in emptyRoomIds set) or is empty type
        return emptyRoomIds.has(slotId) || room.type === 'empty';
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
                        className={`floor-button ${currentFloor === 'outside' ? 'active' : ''}`}
                        onClick={() => setCurrentFloor('outside')}
                    >
                        Outside
                    </button>
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
                            {currentFloor === '1st' ? '1st Floor' : currentFloor === '2nd' ? '2nd Floor' : currentFloor === 'basement' ? 'Basement' : 'Outside'}
                        </div>
                    </div>
                    
                    <div className="info-section">
                        <div className="info-label">Total Rooms</div>
                        <div className="info-value">{slotsWithRooms.length}</div>
                    </div>
                    
                    <div className="info-section">
                        <div className="info-label">Rooms on Floor</div>
                        <div className="info-value">{currentFloorSlots.length}</div>
                    </div>
                    
                    <div className="info-divider"></div>
                    
                    <h4>Floor Summary</h4>
                    <div className="floor-rooms-list">
                        {currentFloorSlots.map((slotWithRoom) => (
                            <div 
                                key={slotWithRoom.slotId} 
                                className={`room-list-item ${selectedSlot?.slotId === slotWithRoom.slotId ? 'active' : ''}`}
                                onClick={() => handleRoomClick(slotWithRoom)}
                            >
                                <span className="room-list-name">{slotWithRoom.room.name}</span>
                                <span className="room-list-level">Lv.{slotWithRoom.room.level}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center - Manor Blueprint with positioned rooms */}
                <div 
                    className="manor-blueprint" 
                    ref={blueprintContainerRef}
                    style={{
                        backgroundImage: `url(${BACKGROUND_IMAGES[currentFloor]})`,
                    }}
                >
                    <div className="rooms-overlay">
                    {currentFloorSlots.map((slotWithRoom) => (
                        <div
                            key={slotWithRoom.slotId}
                            className={`room-box ${selectedSlot?.slotId === slotWithRoom.slotId ? 'selected' : ''} ${isRoomEmpty(slotWithRoom.slotId, slotWithRoom.room) ? 'empty-room' : ''}`}
                            style={{
                                left: `${slotWithRoom.x}%`,
                                top: `${slotWithRoom.y}%`,
                                width: `${slotWithRoom.width}%`,
                                height: `${slotWithRoom.height}%`,
                            }}
                            onClick={() => handleRoomClick(slotWithRoom)}
                        >
                            {isRoomEmpty(slotWithRoom.slotId, slotWithRoom.room) ? (
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
                                        style={{ backgroundImage: `url(${slotWithRoom.room.image})` }}
                                    >
                                        <div className="room-overlay">
                                            <div className="room-name">{slotWithRoom.room.name}</div>
                                            <div className="room-level">Lv. {slotWithRoom.room.level}</div>
                                        </div>
                                    </div>
                                    {slotWithRoom.room.occupant && (
                                        <div className="room-occupant">👤 {slotWithRoom.room.occupant}</div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    </div>
                </div>
                <div className={`room-detail-panel ${selectedRoom ? 'visible' : ''}`}>
                    {selectedRoom && selectedSlot ? (
                        <>
                            {isRoomEmpty(selectedSlot.slotId, selectedRoom) ? (
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
                                                    {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                                </span>
                                            </div>
                                            <div className="stat-row">
                                                <span className="stat-label">📐 Size:</span>
                                                <span className="stat-value">{selectedSlot.width}% × {selectedSlot.height}%</span>
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
                                                    {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
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
