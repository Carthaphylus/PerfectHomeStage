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

// Effect and action descriptors for the room system
export interface RoomEffect {
    icon: string;
    text: string;
    stat?: string;     // Which stat this affects (for future mechanical use)
    value?: number;    // Numeric value (for future calculation)
}

export interface RoomAction {
    icon: string;
    label: string;
    key: string;       // Identifier for action handling
}

// Base Room class - all rooms extend from this
// Only contains room-specific properties, not slot/position data
export abstract class BaseRoom {
    name: string;
    type: string;
    image: string;
    description: string;
    level: number;
    occupant?: string;
    buildable: boolean;  // Can this room type be built by the player?
    location: 'indoors' | 'outdoors'; // Where can this room be placed?

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
        this.buildable = true;
        this.location = 'indoors';
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

    getUpkeep(): number {
        return 0;
    }

    getEffects(): RoomEffect[] {
        return [];
    }

    getActions(): RoomAction[] {
        return [];
    }
}

// Specific room type classes - only define room properties, not position
class YourRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Your Room';
        this.type = 'your_room';
        this.image = YourRoomImg;
        this.description = 'Your personal quarters — a private sanctuary for rest and planning.';
        this.buildable = false;
        this.location = 'indoors';
    }

    getEffects(): RoomEffect[] {
        return [
            { icon: '💤', text: 'Personal rest & recovery', stat: 'rest', value: 1 },
            { icon: '📋', text: 'Planning bonus', stat: 'planning', value: 1 },
            { icon: '🔮', text: 'Private hypnosis sessions', stat: 'hypnosis', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '💤', label: 'Rest', key: 'rest' },
            { icon: '📋', label: 'Plan', key: 'plan' },
        ];
    }
}

class RitualRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Ritual Room';
        this.type = 'ritual';
        this.image = RitualImg;
        this.description = 'A dark chamber for summoning demons and performing unholy rituals.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 8; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '👹', text: 'Unlocks demon summoning', stat: 'summoning', value: 1 },
            { icon: '⛧', text: 'Unlocks unholy rituals', stat: 'rituals', value: 1 },
            { icon: '🖤', text: 'Assigned servant: ++Corruption', stat: 'corruption', value: 2 },
            { icon: '🧠', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '👹', label: 'Summon Demon', key: 'summon_demon' },
            { icon: '⛧', label: 'Perform Ritual', key: 'perform_ritual' },
        ];
    }
}

class QuartersClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Servant Quarters';
        this.type = 'quarters';
        this.image = QuartersImg;
        this.description = 'Comfortable housing for your servants. Each quarters houses up to 10.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 3; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '🛏️', text: `+${this.level * 10} Servant capacity`, stat: 'servant_capacity', value: this.level * 10 },
            { icon: '❤️', text: 'Assigned servant: +Love', stat: 'love', value: 1 },
            { icon: '🧠', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
        ];
    }
}

class ClassroomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Classroom';
        this.type = 'classroom';
        this.image = ClassroomImg;
        this.description = 'A space for education and training. Lessons raise obedience across the board.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '📚', text: '+Obedience for all servants (lessons)', stat: 'obedience_all', value: 1 },
            { icon: '🧠', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
            { icon: '🎓', text: 'Unlocks skill teaching', stat: 'skills', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '📚', label: 'Start Lesson', key: 'start_lesson' },
        ];
    }
}

class StorageClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Storage';
        this.type = 'storage';
        this.image = StorageImg;
        this.description = 'A secure room for storing items and materials.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 2; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '📦', text: `+${this.level * 20} Item capacity`, stat: 'item_capacity', value: this.level * 20 },
        ];
    }
}

class KitchenClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Kitchen';
        this.type = 'kitchen';
        this.image = OvenImg;
        this.description = 'Where meals are prepared for the manor. Good food keeps everyone happy.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '🍖', text: '+Manor-wide morale (food)', stat: 'morale', value: 1 },
            { icon: '💪', text: 'Servant stamina recovery boost', stat: 'stamina', value: 1 },
            { icon: '🍳', text: 'Unlocks meal recipes', stat: 'recipes', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '🍳', label: 'Cook', key: 'cook' },
        ];
    }
}

class LoungeClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Lounge';
        this.type = 'lounge';
        this.image = QuartersImg; // Placeholder
        this.description = 'A comfortable space for relaxation and socializing among servants.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '🛋️', text: '+Manor-wide comfort', stat: 'comfort', value: 1 },
            { icon: '💬', text: 'Social interaction bonus', stat: 'social', value: 1 },
            { icon: '❤️', text: '+Loyalty for visiting servants', stat: 'loyalty', value: 1 },
        ];
    }
}

class CorridorClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Corridor';
        this.type = 'corridor';
        this.image = CorridorImg;
        this.description = 'A long hallway connecting the rooms';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class BrewingRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Brewing Room';
        this.type = 'brewing';
        this.image = BrewingImg;
        this.description = 'A workshop for crafting potions, elixirs, and other concoctions.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 6; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '⚗️', text: 'Unlocks potion crafting', stat: 'potions', value: 1 },
            { icon: '🧪', text: '+Potion potency', stat: 'potion_potency', value: 1 },
            { icon: '🌿', text: 'Produces reagents', stat: 'reagents', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '⚗️', label: 'Brew', key: 'brew' },
        ];
    }
}

class StableClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Stable';
        this.type = 'stable';
        this.image = StableImg;
        this.description = 'Shelter for magical creatures and beasts of burden.';
        this.buildable = true;
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '🐴', text: '+Creature capacity', stat: 'creature_capacity', value: 1 },
            { icon: '💨', text: 'Travel speed bonus', stat: 'travel_speed', value: 1 },
            { icon: '🧬', text: 'Unlocks creature taming', stat: 'taming', value: 1 },
        ];
    }
}

class DungeonClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Dungeon';
        this.type = 'dungeon';
        this.image = DungeonImg;
        this.description = 'A dark chamber for interrogation, punishment, and breaking resistance.';
        this.buildable = false;
        this.location = 'indoors';
    }

    getEffects(): RoomEffect[] {
        return [
            { icon: '😰', text: 'Interrogation chamber', stat: 'interrogation', value: 1 },
            { icon: '⛓️', text: 'Punishment training', stat: 'punishment', value: 1 },
            { icon: '👁️', text: '+Fear generation', stat: 'fear', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '😰', label: 'Interrogate', key: 'interrogate' },
        ];
    }
}

class CellClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Cell';
        this.type = 'cell';
        this.image = CellImg;
        this.description = 'A small holding cell for prisoners. Breaks down resistance over time.';
        this.buildable = true;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 2; }

    getEffects(): RoomEffect[] {
        return [
            { icon: '🔒', text: '+1 Captive capacity', stat: 'captive_capacity', value: 1 },
            { icon: '💫', text: 'Resistance breakdown over time', stat: 'resistance_break', value: 1 },
            { icon: '😶', text: 'Isolation effect (weakens will)', stat: 'isolation', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: '😰', label: 'Interrogate', key: 'interrogate' },
        ];
    }
}

class EmptyRoomClass extends BaseRoom {
    constructor() {
        super(0);
        this.name = 'Empty Room';
        this.type = 'empty';
        this.image = EmptyRoomImg;
        this.description = 'An empty room awaiting construction';
        this.buildable = false;
        this.location = 'indoors';
    }
}

// Get all buildable room types, optionally filtered by location
function getBuildableRoomTypes(locationFilter?: 'indoors' | 'outdoors'): BaseRoom[] {
    const allTypes = [
        'ritual', 'quarters', 'classroom', 'storage', 'kitchen',
        'lounge', 'brewing', 'stable', 'cell'
    ];
    return allTypes
        .map(t => createRoom(t))
        .filter(r => r.buildable && (!locationFilter || r.location === locationFilter));
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
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showBuildPicker, setShowBuildPicker] = useState(false);
    const [catalogueSelection, setCatalogueSelection] = useState<BaseRoom | null>(null);
    const blueprintContainerRef = useRef<HTMLDivElement>(null);

    // ========================================================================
    // SAVE/LOAD SYSTEM
    // ========================================================================
    // Default slots define the physical positions AND starter buildings.
    // On first load (no save), these defaults are used.
    // Once the player builds/removes rooms, the save data takes over.
    // Only roomType/level/occupant are saved — positions are always from defaults.

    const getDefaultSlots = (): RoomSlot[] => [
        // 1st Floor slots
        { slotId: '1st_slot_1', floor: '1st', x: 1,    y: 21, width: 45, height: 22, roomType: 'your_room', level: 1 },
        { slotId: '1st_slot_2', floor: '1st', x: 2,    y: 47, width: 95, height: 15, roomType: 'corridor',  level: 1 },
        { slotId: '1st_slot_3', floor: '1st', x: 34.5, y: 67, width: 30, height: 30, roomType: 'ritual',    level: 1 },
        { slotId: '1st_slot_4', floor: '1st', x: 50,   y: 21, width: 45, height: 22, roomType: 'quarters',  level: 1 },
        { slotId: '1st_slot_5', floor: '1st', x: 2,    y: 67, width: 30, height: 30, roomType: null },
        { slotId: '1st_slot_6', floor: '1st', x: 67,   y: 67, width: 30, height: 30, roomType: null },
        { slotId: '1st_slot_7', floor: '1st', x: 66,   y: 1,  width: 30, height: 18, roomType: null },
        { slotId: '1st_slot_8', floor: '1st', x: 1,    y: 1,  width: 30, height: 18, roomType: null },
        { slotId: '1st_slot_9', floor: '1st', x: 33,   y: 1,  width: 30, height: 18, roomType: null },
        
        // 2nd Floor slots
        { slotId: '2nd_slot_1', floor: '2nd', x: 45,  y: 23, width: 50, height: 20, roomType: 'classroom', level: 1 },
        { slotId: '2nd_slot_2', floor: '2nd', x: 75,  y: 1,  width: 20, height: 20, roomType: 'storage',   level: 1 },
        { slotId: '2nd_slot_3', floor: '2nd', x: 67,  y: 66, width: 30, height: 30, roomType: 'kitchen',   level: 1 },
        { slotId: '2nd_slot_4', floor: '2nd', x: 2,   y: 66, width: 60, height: 30, roomType: 'lounge',    level: 1 },
        { slotId: '2nd_slot_5', floor: '2nd', x: 31,  y: 1,  width: 35, height: 20, roomType: null },
        { slotId: '2nd_slot_6', floor: '2nd', x: 2,   y: 47, width: 95, height: 15, roomType: 'corridor',  level: 1 },
        { slotId: '2nd_slot_7', floor: '2nd', x: 2,   y: 1,  width: 25, height: 20, roomType: 'brewing',   level: 1 },
        { slotId: '2nd_slot_8', floor: '2nd', x: 2,   y: 23, width: 40, height: 20, roomType: null },
        
        // Basement slots
        { slotId: 'basement_slot_1', floor: 'basement', x: 21, y: 51, width: 55, height: 25, roomType: 'dungeon', level: 1 },
        { slotId: 'basement_slot_2', floor: 'basement', x: 22, y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
        { slotId: 'basement_slot_3', floor: 'basement', x: 41, y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
        { slotId: 'basement_slot_4', floor: 'basement', x: 60, y: 23, width: 16, height: 25, roomType: 'cell',    level: 1 },
        
        // Outside slots
        { slotId: 'outside_slot_1', floor: 'outside', x: 1, y: 74, width: 35, height: 25, roomType: 'stable', level: 1 },
    ];

    // Load slots: merge saved data (roomType/level/occupant) with default positions
    const loadSlots = (): RoomSlot[] => {
        const defaults = getDefaultSlots();
        const saved = stage().getManorSlots();
        
        if (!saved || saved.length === 0) {
            return defaults; // First load — use starter buildings
        }

        // Build a lookup from saved data
        const savedMap = new Map(saved.map(s => [s.slotId, s]));
        
        return defaults.map(slot => {
            const savedSlot = savedMap.get(slot.slotId);
            if (savedSlot) {
                return {
                    ...slot,
                    roomType: savedSlot.roomType,
                    level: savedSlot.level,
                    occupant: savedSlot.occupant,
                };
            }
            return slot;
        });
    };

    // Slot state — initialized from chatState or defaults
    const [slotData, setSlotData] = useState<RoomSlot[]>(() => loadSlots());


    // Sync to chatState whenever slotData changes (so it persists on next message send)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const toSave = slotData.map(s => ({
            slotId: s.slotId,
            roomType: s.roomType,
            level: s.level || 1,
            occupant: s.occupant,
        }));
        stage().syncManorSlots(toSave);
    }, [slotData]);



    // Convert slots to SlotWithRoom (combines slot position with room instance)
    const getSlotsWithRooms = (): SlotWithRoom[] => {
        return slotData.map((slot) => {
            const room = createRoom(slot.roomType, slot.level || 1, slot.occupant);
            return { ...slot, room };
        });
    };

    const slotsWithRooms = getSlotsWithRooms();
    const currentFloorSlots = slotsWithRooms.filter(slot => slot.floor === currentFloor);

    // Total daily upkeep across all built rooms
    const totalUpkeep = slotsWithRooms
        .filter(s => s.room.type !== 'empty')
        .reduce((sum, s) => sum + s.room.getUpkeep(), 0);

    // Get the location type for the current floor
    const getFloorLocation = (floor: FloorType): 'indoors' | 'outdoors' => {
        return floor === 'outside' ? 'outdoors' : 'indoors';
    };

    const handleRoomClick = (slotWithRoom: SlotWithRoom) => {
        setSelectedRoom(slotWithRoom.room);
        setSelectedSlot(slotWithRoom);
        setShowBuildPicker(false);
    };
    
    const handleRemoveRoom = () => {
        if (selectedSlot) {
            setSlotData(prev => prev.map(s => 
                s.slotId === selectedSlot.slotId 
                    ? { ...s, roomType: null, level: 1, occupant: undefined }
                    : s
            ));
            setShowRemoveConfirm(false);
            // Update selection to show it's now empty
            const emptyRoom = createRoom(null);
            setSelectedRoom(emptyRoom);
            setSelectedSlot({ ...selectedSlot, roomType: null, room: emptyRoom });
        }
    };

    const handleBuildRoom = (roomType: string) => {
        if (selectedSlot) {
            setSlotData(prev => prev.map(s =>
                s.slotId === selectedSlot.slotId
                    ? { ...s, roomType, level: 1, occupant: undefined }
                    : s
            ));
            setShowBuildPicker(false);
            // Update selection to show the newly built room
            const newRoom = createRoom(roomType);
            setSelectedRoom(newRoom);
            setSelectedSlot({ ...selectedSlot, roomType, room: newRoom });
        }
    };
    
    const isRoomEmpty = (slotId: string, room: BaseRoom) => {
        return room.type === 'empty';
    };

    return (
        <div className="manor-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
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

                    <div className="info-section">
                        <div className="info-label">Daily Upkeep</div>
                        <div className="info-value">🔧 {totalUpkeep} gold/day</div>
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
                                    <div className="room-detail-scrollable">
                                        <div className="room-detail-header">
                                            <h3>Empty Slot</h3>
                                            <span className="room-type-badge empty">{getFloorLocation(selectedSlot.floor)}</span>
                                        </div>
                                        
                                        <div className="room-preview-image" style={{ backgroundImage: `url(${EmptyRoomImg})` }}></div>
                                        
                                        <div className="room-detail-content">
                                            <p className="room-description">This space is available for construction.</p>
                                            
                                            <div className="room-stats">
                                                <div className="stat-row">
                                                    <span className="stat-label">📍 Location:</span>
                                                    <span className="stat-value">
                                                        {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                                    </span>
                                                </div>
                                                <div className="stat-row">
                                                    <span className="stat-label">🏷️ Type:</span>
                                                    <span className="stat-value">{getFloorLocation(selectedSlot.floor) === 'outdoors' ? 'Outdoor' : 'Indoor'} slot</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="room-actions">
                                        <button 
                                            className="action-button primary" 
                                            onClick={() => setShowBuildPicker(true)}
                                        >
                                            🏗️ Build Room
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="room-detail-scrollable">
                                        <div className="room-detail-header">
                                            <h3>{selectedRoom.name}</h3>
                                            <span className="room-type-badge">{selectedRoom.type.replace('_', ' ')}</span>
                                            <span className={`room-location-badge ${selectedRoom.location}`}>{selectedRoom.location}</span>
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
                                                {selectedRoom.getEffects().length > 0 ? (
                                                    selectedRoom.getEffects().map((effect, i) => (
                                                        <div key={i} className="effect-item">
                                                            <span className="effect-icon">{effect.icon}</span>
                                                            <span className="effect-text">{effect.text}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="effect-item">
                                                        <span className="effect-icon">—</span>
                                                        <span className="effect-text">No special effects</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {selectedRoom.getUpkeep() > 0 && (
                                                <div className="upgrade-info">
                                                    <h4>Upkeep</h4>
                                                    <div className="upgrade-cost">
                                                        <span>🔧 {selectedRoom.getUpkeep()} gold/day</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="upgrade-info">
                                                <h4>Next Upgrade</h4>
                                                <div className="upgrade-cost">
                                                    <span>💎 Cost: {selectedRoom.getUpgradeCost()} Gold</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="room-actions">
                                        <button className="action-button primary">⬆️ Upgrade</button>
                                        <button className="action-button">🎭 Enter</button>
                                        {selectedRoom.getActions().map((action, i) => (
                                            <button key={i} className="action-button">
                                                {action.icon} {action.label}
                                            </button>
                                        ))}
                                        {selectedRoom.buildable && (
                                            <button 
                                                className="action-button danger" 
                                                onClick={() => setShowRemoveConfirm(true)}
                                            >
                                                🗑️ Remove
                                            </button>
                                        )}
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
            
            {/* Room Catalogue Overlay */}
            {showBuildPicker && selectedSlot && (() => {
                const buildableRooms = getBuildableRoomTypes(getFloorLocation(selectedSlot.floor));
                const preview = catalogueSelection || buildableRooms[0] || null;
                return (
                    <div className="catalogue-overlay" onClick={() => { setShowBuildPicker(false); setCatalogueSelection(null); }}>
                        <div className="catalogue-panel" onClick={e => e.stopPropagation()}>
                            <div className="catalogue-header">
                                <h3>Room Catalogue</h3>
                                <span className="catalogue-slot-badge">
                                    {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                </span>
                                <button className="catalogue-close" onClick={() => { setShowBuildPicker(false); setCatalogueSelection(null); }}>✕</button>
                            </div>
                            <div className="catalogue-body">
                                {/* Left: thumbnail grid */}
                                <div className="catalogue-grid">
                                    {buildableRooms.map(room => (
                                        <div
                                            key={room.type}
                                            className={`catalogue-thumb ${preview?.type === room.type ? 'selected' : ''}`}
                                            onClick={() => setCatalogueSelection(room)}
                                        >
                                            <div className="catalogue-thumb-image" style={{ backgroundImage: `url(${room.image})` }}>
                                                <div className="catalogue-thumb-overlay" />
                                            </div>
                                            <span className="catalogue-thumb-name">{room.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Right: detail panel */}
                                {preview && (
                                    <div className="catalogue-detail">
                                        <div className="catalogue-detail-image" style={{ backgroundImage: `url(${preview.image})` }} />
                                        <div className="catalogue-detail-info">
                                            <h3 className="catalogue-detail-name">{preview.name}</h3>
                                            <p className="catalogue-detail-desc">{preview.description}</p>

                                            <div className="catalogue-detail-section">
                                                <h4>Effects</h4>
                                                {preview.getEffects().map((effect, i) => (
                                                    <div key={i} className="catalogue-detail-row">
                                                        <span className="catalogue-detail-label">{effect.icon} {effect.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="catalogue-detail-section">
                                                <h4>Costs</h4>
                                                <div className="catalogue-detail-row">
                                                    <span className="catalogue-detail-label">🏗️ Build Cost</span>
                                                    <span className="catalogue-detail-value">{preview.getUpgradeCost()} gold</span>
                                                </div>
                                                <div className="catalogue-detail-row">
                                                    <span className="catalogue-detail-label">🔧 Upkeep</span>
                                                    <span className="catalogue-detail-value">{preview.getUpkeep()} gold/day</span>
                                                </div>
                                            </div>

                                            <div className="catalogue-detail-section">
                                                <div className="catalogue-detail-row">
                                                    <span className="catalogue-detail-label">📍 Placement</span>
                                                    <span className="catalogue-detail-value">{preview.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="catalogue-build-btn"
                                            onClick={() => { handleBuildRoom(preview.type); setCatalogueSelection(null); }}
                                        >
                                            🏗️ Build {preview.name}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

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
