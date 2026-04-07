import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import { ROOM_ROLES, getRoomBuildCost, canAffordRoom, getMissingMaterials, deductRoomCost } from '../data';
import type { Role, RoomBuildCost } from '../data';
import { GameIcon } from './GameIcon';
import { LayoutEditorHandles, LayoutEditorPanel } from './LayoutEditor';
import type { LayoutSlot } from './LayoutEditor';


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

// Icons
import IconPlus from '../assets/Images/Icons/plus.png';
import IconCross from '../assets/Images/Icons/cross.png';
import IconChat from '../assets/Images/Icons/chat.png';

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
type BuildZone = 'mansion' | 'basement' | 'outside';

// Effect and action descriptors for the room system
interface RoomEffect {
    icon: string;
    text: string;
    stat?: string;     // Which stat this affects (for future mechanical use)
    value?: number;    // Numeric value (for future calculation)
}

interface RoomAction {
    icon: string;
    label: string;
    key: string;       // Identifier for action handling
}

// Base Room class - all rooms extend from this
// Only contains room-specific properties, not slot/position data
abstract class BaseRoom {
    name: string;
    type: string;
    image: string;
    description: string;
    level: number;
    occupant?: string;
    buildable: boolean;  // Can this room type be built by the player?
    buildZone?: BuildZone; // Where can this room be built? (only relevant if buildable)
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

    /** Roles unlocked by this room type (looked up from ROOM_ROLES registry) */
    getRoles(): Role[] {
        return ROOM_ROLES[this.type] || [];
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
            { icon: 'moon', text: 'Personal rest & recovery', stat: 'rest', value: 1 },
            { icon: 'clipboard-list', text: 'Planning bonus', stat: 'planning', value: 1 },
            { icon: 'gem', text: 'Private hypnosis sessions', stat: 'hypnosis', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'moon', label: 'Rest', key: 'rest' },
            { icon: 'clipboard-list', label: 'Plan', key: 'plan' },
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
        this.buildZone = 'basement';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 8; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'skull', text: 'Unlocks demon summoning', stat: 'summoning', value: 1 },
            { icon: 'pentagram', text: 'Unlocks unholy rituals', stat: 'rituals', value: 1 },
            { icon: 'heart-crack', text: 'Assigned servant: ++Corruption', stat: 'corruption', value: 2 },
            { icon: 'brain', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'skull', label: 'Summon Demon', key: 'summon_demon' },
            { icon: 'pentagram', label: 'Perform Ritual', key: 'perform_ritual' },
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
        this.buildable = false;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 3; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'bed-double', text: `+${this.level * 10} Servant capacity`, stat: 'servant_capacity', value: this.level * 10 },
            { icon: 'heart', text: 'Assigned servant: +Love', stat: 'love', value: 1 },
            { icon: 'brain', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
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
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'book-copy', text: '+Obedience for all servants (lessons)', stat: 'obedience_all', value: 1 },
            { icon: 'brain', text: 'Assigned servant: +Obedience', stat: 'obedience', value: 1 },
            { icon: 'graduation-cap', text: 'Unlocks skill teaching', stat: 'skills', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'book-copy', label: 'Start Lesson', key: 'start_lesson' },
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
        this.buildable = false;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 2; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'package', text: `+${this.level * 20} Item capacity`, stat: 'item_capacity', value: this.level * 20 },
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
        this.buildable = false;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'beef', text: '+Manor-wide morale (food)', stat: 'morale', value: 1 },
            { icon: 'dumbbell', text: 'Servant stamina recovery boost', stat: 'stamina', value: 1 },
            { icon: 'cooking-pot', text: 'Unlocks meal recipes', stat: 'recipes', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'cooking-pot', label: 'Cook', key: 'cook' },
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
        this.buildable = false;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'armchair', text: '+Manor-wide comfort', stat: 'comfort', value: 1 },
            { icon: 'message-circle', text: 'Social interaction bonus', stat: 'social', value: 1 },
            { icon: 'heart', text: '+Loyalty for visiting servants', stat: 'loyalty', value: 1 },
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
        this.buildZone = 'basement';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 6; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'flask', text: 'Unlocks potion crafting', stat: 'potions', value: 1 },
            { icon: 'test-tubes', text: '+Potion potency', stat: 'potion_potency', value: 1 },
            { icon: 'leaf', text: 'Produces reagents', stat: 'reagents', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'flask', label: 'Brew', key: 'brew' },
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
        this.buildZone = 'outside';
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'footprints', text: '+Creature capacity', stat: 'creature_capacity', value: 1 },
            { icon: 'wind', text: 'Travel speed bonus', stat: 'travel_speed', value: 1 },
            { icon: 'dna', text: 'Unlocks creature taming', stat: 'taming', value: 1 },
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
            { icon: 'frown', text: 'Interrogation chamber', stat: 'interrogation', value: 1 },
            { icon: 'link', text: 'Punishment training', stat: 'punishment', value: 1 },
            { icon: 'eye', text: '+Fear generation', stat: 'fear', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'frown', label: 'Interrogate', key: 'interrogate' },
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
        this.buildable = false;
        this.location = 'indoors';
    }

    getUpkeep(): number { return 2; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'lock', text: '+1 Captive capacity', stat: 'captive_capacity', value: 1 },
            { icon: 'sparkle', text: 'Resistance breakdown over time', stat: 'resistance_break', value: 1 },
            { icon: 'ban', text: 'Isolation effect (weakens will)', stat: 'isolation', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'frown', label: 'Interrogate', key: 'interrogate' },
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

// ============================================================================
// DECORATIVE ROOMS — Aesthetic-only, no mechanical purpose
// ============================================================================

class WardrobeClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Wardrobe';
        this.type = 'wardrobe';
        this.image = StorageImg;
        this.description = 'A walk-in wardrobe filled with fine garments and enchanted robes.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class BathroomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Bathroom';
        this.type = 'bathroom';
        this.image = QuartersImg;
        this.description = 'A lavish bathing chamber with steaming pools and scented oils.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class HallwayNookClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Hallway Nook';
        this.type = 'hallway_nook';
        this.image = CorridorImg;
        this.description = 'A cozy alcove tucked into the corridor, with a cushioned bench and a candle.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class LibraryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Library';
        this.type = 'library';
        this.image = ClassroomImg;
        this.description = 'Towering shelves of forbidden tomes, arcane scrolls, and manuscripts of forgotten lore. Knowledge is power — and danger.';
        this.buildable = false;
        this.location = 'indoors';
    }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'book-open', text: '+Research speed (manor-wide)', stat: 'research_speed', value: this.level },
            { icon: 'scroll', text: 'Unlocks spell research', stat: 'spell_research', value: 1 },
            { icon: 'book-lock', text: 'Forbidden knowledge discovery', stat: 'forbidden_knowledge', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'book-open', label: 'Study Tomes', key: 'study_tomes' },
            { icon: 'scroll', label: 'Research Spells', key: 'research_spells' },
        ];
    }
}

class GalleryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Gallery';
        this.type = 'gallery';
        this.image = EmptyRoomImg;
        this.description = 'A long hall adorned with portraits, tapestries, and trophy displays.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class BalconyClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Balcony';
        this.type = 'balcony';
        this.image = EmptyRoomImg;
        this.description = 'An open-air terrace overlooking the manor grounds, perfect for moonlit contemplation.';
        this.buildable = false;
        this.location = 'outdoors';
    }
}

class FountainClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Fountain';
        this.type = 'fountain';
        this.image = EmptyRoomImg;
        this.description = 'An ornate fountain with gently cascading enchanted water.';
        this.buildable = false;
        this.location = 'outdoors';
    }
}

class GardenClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Garden';
        this.type = 'garden';
        this.image = StableImg;
        this.description = 'A lush garden filled with exotic flora, winding paths, and the hum of fae insects.';
        this.buildable = false;
        this.location = 'outdoors';
    }
}

class TrophyRoomClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Trophy Room';
        this.type = 'trophy_room';
        this.image = DungeonImg;
        this.description = 'A dim chamber displaying conquered relics, enchanted artifacts, and mementos of dominance.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class StairwayClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Stairway';
        this.type = 'stairway';
        this.image = CorridorImg;
        this.description = 'A winding staircase connecting the manor floors, its stone steps worn smooth by countless footsteps.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class MainHallClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Main Hall';
        this.type = 'main_hall';
        this.image = EmptyRoomImg;
        this.description = 'The grand central hall of the manor, with vaulted ceilings, a roaring hearth, and banners adorning the walls.';
        this.buildable = false;
        this.location = 'indoors';
    }
}

class TerraceClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Terrace';
        this.type = 'terrace';
        this.image = EmptyRoomImg;
        this.description = 'A sun-dappled stone terrace draped in climbing ivy, overlooking the manor grounds.';
        this.buildable = false;
        this.location = 'outdoors';
    }
}

// ============================================================================
// BUILDABLE ROOMS — Player-constructible, zone-restricted
// ============================================================================

class InfirmaryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Infirmary';
        this.type = 'infirmary';
        this.image = QuartersImg;
        this.description = 'A clean, well-lit room lined with cots and healing supplies. Servants recover here after injury or exhaustion.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'heart-pulse', text: 'Servant healing & recovery', stat: 'healing', value: this.level },
            { icon: 'dumbbell', text: `+${this.level * 15}% Stamina restoration rate`, stat: 'stamina_restore', value: this.level * 15 },
            { icon: 'shield-plus', text: 'Reduces injury downtime', stat: 'injury_recovery', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'heart-pulse', label: 'Heal', key: 'heal' },
            { icon: 'pill', label: 'Administer Medicine', key: 'medicine' },
        ];
    }
}

class LaboratoryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Laboratory';
        this.type = 'laboratory';
        this.image = BrewingImg;
        this.description = 'A dim, bubbling laboratory crammed with arcane instruments, specimen jars, and crackling tesla coils.';
        this.buildable = true;
        this.buildZone = 'basement';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 8; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'microscope', text: 'Unlocks experimentation', stat: 'experimentation', value: 1 },
            { icon: 'dna', text: 'Creature modification research', stat: 'creature_mod', value: this.level },
            { icon: 'brain', text: 'Dark science breakthroughs', stat: 'dark_science', value: this.level },
            { icon: 'heart-crack', text: 'Assigned servant: ++Corruption', stat: 'corruption', value: 2 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'microscope', label: 'Experiment', key: 'experiment' },
            { icon: 'dna', label: 'Modify Creature', key: 'modify_creature' },
        ];
    }
}

class CryptClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Crypt';
        this.type = 'crypt';
        this.image = DungeonImg;
        this.description = 'A cold, echoing tomb beneath the manor. The dead do not rest easy here — by design.';
        this.buildable = true;
        this.buildZone = 'basement';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 7; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'skull', text: 'Unlocks undead servants', stat: 'undead', value: this.level },
            { icon: 'ghost', text: 'Necromancy rituals', stat: 'necromancy', value: this.level },
            { icon: 'flame', text: 'Soul harvesting', stat: 'soul_harvest', value: this.level },
            { icon: 'eye', text: '+Fear aura (manor-wide)', stat: 'fear', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'skull', label: 'Raise Undead', key: 'raise_undead' },
            { icon: 'flame', label: 'Harvest Souls', key: 'harvest_souls' },
        ];
    }
}

class WineCellarClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Wine Cellar';
        this.type = 'wine_cellar';
        this.image = StorageImg;
        this.description = 'Rows of dusty barrels and fine vintages. A source of trade income and liquid morale.';
        this.buildable = true;
        this.buildZone = 'basement';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 3; }

    getIncomePerDay(): number { return this.level * 25; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'wine', text: `+${this.level * 25} Gold/day from trade`, stat: 'trade_income', value: this.level * 25 },
            { icon: 'smile', text: '+Manor-wide morale (luxury)', stat: 'morale', value: 1 },
            { icon: 'package', text: `+${this.level * 10} Storage capacity`, stat: 'storage', value: this.level * 10 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'wine', label: 'Trade Wines', key: 'trade_wines' },
        ];
    }
}

class GreenhouseClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Greenhouse';
        this.type = 'greenhouse';
        this.image = StableImg;
        this.description = 'A glass-roofed growing house brimming with exotic herbs, luminous fungi, and alchemical plants.';
        this.buildable = true;
        this.buildZone = 'outside';
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'leaf', text: 'Produces potion ingredients', stat: 'ingredients', value: this.level },
            { icon: 'flower', text: `+${this.level * 3} Herb yield per harvest`, stat: 'herb_yield', value: this.level * 3 },
            { icon: 'flask', text: 'Synergy with Brewing Room', stat: 'brewing_synergy', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'leaf', label: 'Harvest Herbs', key: 'harvest_herbs' },
            { icon: 'flower', label: 'Tend Plants', key: 'tend_plants' },
        ];
    }
}

class ObservatoryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Observatory';
        this.type = 'observatory';
        this.image = EmptyRoomImg;
        this.description = 'A towering spire capped with an enchanted telescope that peers into the fabric of fate itself.';
        this.buildable = true;
        this.buildZone = 'outside';
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 6; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'telescope', text: 'Divination & star-reading', stat: 'divination', value: this.level },
            { icon: 'eye', text: 'Event foresight (preview upcoming events)', stat: 'foresight', value: this.level },
            { icon: 'sparkles', text: '+Arcane research speed', stat: 'arcane_research', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'telescope', label: 'Gaze at Stars', key: 'stargaze' },
            { icon: 'eye', label: 'Divine Future', key: 'divine_future' },
        ];
    }
}

class TrainingGroundsClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Training Grounds';
        this.type = 'training_grounds';
        this.image = EmptyRoomImg;
        this.description = 'A muddy yard of sparring dummies, archery targets, and obstacle courses. Guards are forged here.';
        this.buildable = true;
        this.buildZone = 'outside';
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'swords', text: 'Combat training for servants', stat: 'combat_training', value: this.level },
            { icon: 'shield', text: `+${this.level * 10}% Guard strength`, stat: 'guard_strength', value: this.level * 10 },
            { icon: 'dumbbell', text: '+Stamina growth rate', stat: 'stamina_growth', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'swords', label: 'Train Guards', key: 'train_guards' },
            { icon: 'dumbbell', label: 'Drill Servants', key: 'drill_servants' },
        ];
    }
}

class GraveyardClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Graveyard';
        this.type = 'graveyard';
        this.image = EmptyRoomImg;
        this.description = 'A fog-shrouded cemetery of crooked headstones and whispering spirits. A prerequisite for darker arts.';
        this.buildable = true;
        this.buildZone = 'outside';
        this.location = 'outdoors';
    }

    getUpkeep(): number { return 3; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'skull', text: 'Necromancy prerequisite', stat: 'necro_prereq', value: 1 },
            { icon: 'ghost', text: 'Spirit summoning ground', stat: 'spirit_summon', value: this.level },
            { icon: 'eye', text: '+Fear aura (outside)', stat: 'fear_outside', value: this.level },
            { icon: 'bone', text: 'Produces corpse materials', stat: 'corpse_materials', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'ghost', label: 'Commune with Dead', key: 'commune_dead' },
            { icon: 'skull', label: 'Exhume', key: 'exhume' },
        ];
    }
}

class EnchantingWorkshopClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Enchanting Workshop';
        this.type = 'enchanting_workshop';
        this.image = BrewingImg;
        this.description = 'A cluttered workshop humming with arcane energy. Rune-etched workbenches and floating crystals fill the air with a violet glow.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 6; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'sparkles', text: 'Unlocks item enchantment', stat: 'enchantment', value: 1 },
            { icon: 'wand', text: `+${this.level * 10}% Enchant potency`, stat: 'enchant_potency', value: this.level * 10 },
            { icon: 'gem', text: 'Imbue items with magical effects', stat: 'imbue', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'sparkles', label: 'Enchant', key: 'enchant' },
            { icon: 'wand', label: 'Imbue', key: 'imbue' },
        ];
    }
}

class StudyClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Study';
        this.type = 'study';
        this.image = ClassroomImg;
        this.description = 'A private office of dark mahogany and candlelight. Maps, dossiers, and half-finished plans cover every surface.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 3; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'map', text: 'Quest planning & tracking', stat: 'quest_planning', value: this.level },
            { icon: 'search', text: `+${this.level * 15}% Research speed`, stat: 'research_speed', value: this.level * 15 },
            { icon: 'lightbulb', text: 'Unlocks new techniques', stat: 'techniques', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'search', label: 'Research', key: 'research' },
            { icon: 'clipboard-list', label: 'Plan', key: 'plan' },
        ];
    }
}

class ArmoryClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Armory';
        this.type = 'armory';
        this.image = StorageImg;
        this.description = 'Racks of polished weapons, suits of enchanted armor, and the acrid scent of oiled steel. The manor\'s teeth.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'shield', text: `+${this.level * 10}% Manor defense`, stat: 'defense', value: this.level * 10 },
            { icon: 'swords', text: 'Guard equipment upgrades', stat: 'guard_equip', value: this.level },
            { icon: 'hammer', text: 'Weapon & armor forging', stat: 'forging', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'hammer', label: 'Forge', key: 'forge' },
            { icon: 'shield', label: 'Equip Guards', key: 'equip_guards' },
        ];
    }
}

class ChapelClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Dark Chapel';
        this.type = 'chapel';
        this.image = RitualImg;
        this.description = 'A candlelit chapel of inverted icons and whispered litanies. Devotion is reshaped here — faith bent to serve the master.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'church', text: 'Devotion training', stat: 'devotion', value: this.level },
            { icon: 'brain', text: 'Assigned servant: ++Obedience', stat: 'obedience', value: 2 },
            { icon: 'heart-crack', text: 'Assigned servant: +Corruption', stat: 'corruption', value: 1 },
            { icon: 'flame', text: 'Dark worship empowerment', stat: 'dark_worship', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'church', label: 'Hold Service', key: 'hold_service' },
            { icon: 'flame', label: 'Corrupt Faith', key: 'corrupt_faith' },
        ];
    }
}

class PerformanceHallClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Performance Hall';
        this.type = 'performance_hall';
        this.image = EmptyRoomImg;
        this.description = 'A grand hall of velvet curtains, enchanted acoustics, and a stage for mesmerizing performances. Music here carries... suggestions.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'music', text: '+Manor-wide morale (entertainment)', stat: 'morale', value: this.level },
            { icon: 'eye', text: 'Mesmerism through performance', stat: 'mesmerism', value: this.level },
            { icon: 'smile', text: 'Audience: +Love, +Obedience', stat: 'audience_effect', value: 1 },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'music', label: 'Perform', key: 'perform' },
            { icon: 'eye', label: 'Mesmerize', key: 'mesmerize' },
        ];
    }
}

class BathhouseClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Bathhouse';
        this.type = 'bathhouse';
        this.image = QuartersImg;
        this.description = 'Steaming marble pools, scented oils, and warm towels. A place of vulnerability, relaxation, and quietly deepening bonds.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 4; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'heart', text: 'Assigned servant: +Love', stat: 'love', value: 1 },
            { icon: 'dumbbell', text: `+${this.level * 20}% Stamina recovery`, stat: 'stamina_recovery', value: this.level * 20 },
            { icon: 'handshake', text: 'Trust & intimacy building', stat: 'trust', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'droplets', label: 'Bathe', key: 'bathe' },
            { icon: 'handshake', label: 'Socialize', key: 'socialize' },
        ];
    }
}

class BoudoirClass extends BaseRoom {
    constructor(level: number = 1, occupant?: string) {
        super(level, occupant);
        this.name = 'Boudoir';
        this.type = 'boudoir';
        this.image = YourRoomImg;
        this.description = 'A dimly lit chamber of silk, perfume, and whispered promises. Charm and seduction are the weapons wielded here.';
        this.buildable = true;
        this.buildZone = 'mansion';
        this.location = 'indoors';
    }

    getUpkeep(): number { return 5; }

    getEffects(): RoomEffect[] {
        return [
            { icon: 'heart', text: 'Assigned servant: ++Love', stat: 'love', value: 2 },
            { icon: 'heart-crack', text: 'Assigned servant: ++Corruption', stat: 'corruption', value: 2 },
            { icon: 'sparkle', text: 'Seduction conditioning', stat: 'seduction', value: this.level },
            { icon: 'gem', text: 'Charm manipulation', stat: 'charm', value: this.level },
        ];
    }

    getActions(): RoomAction[] {
        return [
            { icon: 'heart', label: 'Seduce', key: 'seduce' },
            { icon: 'sparkle', label: 'Charm', key: 'charm' },
        ];
    }
}

// Get all buildable room types, optionally filtered by build zone
function getBuildableRoomTypes(zoneFilter?: BuildZone): BaseRoom[] {
    const allTypes = [
        'ritual', 'classroom', 'brewing', 'stable',
        'infirmary', 'laboratory', 'crypt', 'wine_cellar',
        'greenhouse', 'observatory', 'training_grounds', 'graveyard',
        'enchanting_workshop', 'study', 'armory', 'chapel',
        'performance_hall', 'bathhouse', 'boudoir'
    ];
    return allTypes
        .map(t => createRoom(t))
        .filter(r => r.buildable && (!zoneFilter || r.buildZone === zoneFilter));
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
        case 'wardrobe':
            return new WardrobeClass(level, occupant);
        case 'bathroom':
            return new BathroomClass(level, occupant);
        case 'hallway_nook':
            return new HallwayNookClass(level, occupant);
        case 'library':
            return new LibraryClass(level, occupant);
        case 'gallery':
            return new GalleryClass(level, occupant);
        case 'balcony':
            return new BalconyClass(level, occupant);
        case 'fountain':
            return new FountainClass(level, occupant);
        case 'garden':
            return new GardenClass(level, occupant);
        case 'trophy_room':
            return new TrophyRoomClass(level, occupant);
        case 'stairway':
            return new StairwayClass(level, occupant);
        case 'main_hall':
            return new MainHallClass(level, occupant);
        case 'terrace':
            return new TerraceClass(level, occupant);
        case 'infirmary':
            return new InfirmaryClass(level, occupant);
        case 'laboratory':
            return new LaboratoryClass(level, occupant);
        case 'crypt':
            return new CryptClass(level, occupant);
        case 'wine_cellar':
            return new WineCellarClass(level, occupant);
        case 'greenhouse':
            return new GreenhouseClass(level, occupant);
        case 'observatory':
            return new ObservatoryClass(level, occupant);
        case 'training_grounds':
            return new TrainingGroundsClass(level, occupant);
        case 'graveyard':
            return new GraveyardClass(level, occupant);
        case 'enchanting_workshop':
            return new EnchantingWorkshopClass(level, occupant);
        case 'study':
            return new StudyClass(level, occupant);
        case 'armory':
            return new ArmoryClass(level, occupant);
        case 'chapel':
            return new ChapelClass(level, occupant);
        case 'performance_hall':
            return new PerformanceHallClass(level, occupant);
        case 'bathhouse':
            return new BathhouseClass(level, occupant);
        case 'boudoir':
            return new BoudoirClass(level, occupant);
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
    '1st': Floor2Img,
    '2nd': Floor1Img,
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
    const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);
    const [layoutEditorSlots, setLayoutEditorSlots] = useState<LayoutSlot[] | null>(null);
    const [leSelectedSlotId, setLeSelectedSlotId] = useState<string | null>(null);
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
        { slotId: '1st_slot_1', floor: '1st', x: 44, y: 21, width: 30, height: 19, roomType: null },
        { slotId: '1st_slot_2', floor: '1st', x: 74, y: 63, width: 25, height: 16, roomType: 'storage', level: 1 },
        { slotId: '1st_slot_3', floor: '1st', x: 64, y: 42, width: 35, height: 19, roomType: 'kitchen', level: 1 },
        { slotId: '1st_slot_4', floor: '1st', x: 21, y: 42, width: 41, height: 19, roomType: 'lounge', level: 1 },
        { slotId: '1st_slot_5', floor: '1st', x: 44, y: 0, width: 30, height: 19, roomType: null },
        { slotId: '1st_slot_6', floor: '1st', x: 0, y: 0, width: 10, height: 40, roomType: 'stairway', level: 1 },
        { slotId: '1st_slot_7', floor: '1st', x: 12, y: 0, width: 30, height: 19, roomType: null },
        { slotId: '1st_slot_8', floor: '1st', x: 12, y: 21, width: 30, height: 19, roomType: null },
        { slotId: '1st_slot_9', floor: '1st', x: 76, y: 0, width: 23, height: 40, roomType: 'library', level: 1 },
        { slotId: '1st_slot_10', floor: '1st', x: 74, y: 81, width: 25, height: 18, roomType: 'stairway', level: 1 },
        { slotId: '1st_slot_12', floor: '1st', x: 33, y: 63, width: 39, height: 36, roomType: 'main_hall', level: 1 },
        { slotId: '1st_slot_13', floor: '1st', x: 0, y: 63, width: 19, height: 36, roomType: 'terrace', level: 1 },
        { slotId: '1st_slot_14', floor: '1st', x: 21, y: 63, width: 10, height: 36, roomType: 'corridor', level: 1 },
        { slotId: '1st_slot_15', floor: '1st', x: 0, y: 42, width: 19, height: 19, roomType: 'hallway_nook', level: 1 },
        
        // 2nd Floor slots
        { slotId: '2nd_slot_1', floor: '2nd', x: 12, y: 0, width: 31, height: 19, roomType: 'your_room', level: 1 },
        { slotId: '2nd_slot_2', floor: '2nd', x: 0, y: 43, width: 99, height: 10, roomType: 'corridor', level: 1 },
        { slotId: '2nd_slot_4', floor: '2nd', x: 45, y: 21, width: 54, height: 20, roomType: 'quarters', level: 1 },
        { slotId: '2nd_slot_5', floor: '2nd', x: 0, y: 55, width: 32, height: 21, roomType: null },
        { slotId: '2nd_slot_6', floor: '2nd', x: 67, y: 55, width: 32, height: 21, roomType: null },
        { slotId: '2nd_slot_7', floor: '2nd', x: 45, y: 0, width: 21, height: 19, roomType: 'wardrobe', level: 1 },
        { slotId: '2nd_slot_8', floor: '2nd', x: 68, y: 0, width: 31, height: 19, roomType: 'trophy_room', level: 1 },
        { slotId: '2nd_slot_9', floor: '2nd', x: 12, y: 21, width: 31, height: 20, roomType: null },
        { slotId: '2nd_slot_10', floor: '2nd', x: 67, y: 78, width: 32, height: 21, roomType: null },
        { slotId: '2nd_slot_12', floor: '2nd', x: 0, y: 78, width: 32, height: 21, roomType: null },
        { slotId: '2nd_slot_14', floor: '2nd', x: 0, y: 0, width: 10, height: 40, roomType: 'stairway', level: 1 },
        { slotId: '2nd_slot_13', floor: '2nd', x: 34, y: 55, width: 31, height: 21, roomType: null },
        { slotId: '2nd_slot_15', floor: '2nd', x: 34, y: 78, width: 31, height: 21, roomType: 'balcony', level: 1 },
        
        // Basement slots
        { slotId: 'basement_slot_1', floor: 'basement', x: 44, y: 74, width: 55, height: 25, roomType: 'dungeon', level: 1 },
        { slotId: 'basement_slot_2', floor: 'basement', x: 38, y: 45, width: 19, height: 27, roomType: 'cell', level: 1 },
        { slotId: 'basement_slot_3', floor: 'basement', x: 59, y: 45, width: 19, height: 27, roomType: 'cell', level: 1 },
        { slotId: 'basement_slot_4', floor: 'basement', x: 80, y: 45, width: 19, height: 27, roomType: 'cell', level: 1 },
        { slotId: 'basement_slot_5', floor: 'basement', x: 17, y: 45, width: 19, height: 27, roomType: 'cell', level: 1 },
        { slotId: 'basement_slot_6', floor: 'basement', x: 0, y: 74, width: 42, height: 25, roomType: null },
        { slotId: 'basement_slot_7', floor: 'basement', x: 0, y: 45, width: 15, height: 27, roomType: 'corridor', level: 1 },
        { slotId: 'basement_slot_8', floor: 'basement', x: 34, y: 0, width: 31, height: 20, roomType: null },
        { slotId: 'basement_slot_9', floor: 'basement', x: 67, y: 0, width: 31, height: 20, roomType: null },
        { slotId: 'basement_slot_10', floor: 'basement', x: 34, y: 23, width: 31, height: 20, roomType: null },
        { slotId: 'basement_slot_11', floor: 'basement', x: 67, y: 23, width: 31, height: 20, roomType: null },
        { slotId: 'basement_slot_12', floor: 'basement', x: 1, y: 0, width: 31, height: 20, roomType: null },
        { slotId: 'basement_slot_13', floor: 'basement', x: 1, y: 23, width: 31, height: 20, roomType: null },
        
        // Outside slots
        { slotId: 'outside_slot_1', floor: 'outside', x: 1, y: 74, width: 35, height: 25, roomType: 'stable', level: 1 },
        { slotId: 'outside_slot_2', floor: 'outside', x: 71, y: 72, width: 28, height: 27, roomType: 'garden', level: 1 },
        
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
    // Always read positions from getDefaultSlots() so coordinate changes apply
    // immediately (including during HMR), while room data comes from state.
    const getSlotsWithRooms = (): SlotWithRoom[] => {
        const defaults = getDefaultSlots();
        const slotDataMap = new Map(slotData.map(s => [s.slotId, s]));
        return defaults.map((defSlot) => {
            const stateSlot = slotDataMap.get(defSlot.slotId);
            // Use stateSlot data if it exists (even if roomType is null = removed room)
            // Only fall back to defaults when there's no state entry at all
            const roomType = stateSlot ? stateSlot.roomType : defSlot.roomType;
            const level = stateSlot?.level ?? defSlot.level ?? 1;
            const occupant = stateSlot?.occupant ?? defSlot.occupant;
            const room = createRoom(roomType, level, occupant);
            return { ...defSlot, roomType, level, occupant, room };
        });
    };

    const slotsWithRooms = getSlotsWithRooms();
    const currentFloorSlots = slotsWithRooms.filter(slot => slot.floor === currentFloor);

    // Total daily upkeep across all built rooms
    const totalUpkeep = slotsWithRooms
        .filter(s => s.room.type !== 'empty')
        .reduce((sum, s) => sum + s.room.getUpkeep(), 0);

    // Get the location type for the current floor (display)
    const getFloorLocation = (floor: FloorType): 'indoors' | 'outdoors' => {
        return floor === 'outside' ? 'outdoors' : 'indoors';
    };

    // Get the build zone for the current floor (filtering)
    const getFloorBuildZone = (floor: FloorType): BuildZone => {
        if (floor === 'outside') return 'outside';
        if (floor === 'basement') return 'basement';
        return 'mansion';
    };

    const handleRoomClick = (slotWithRoom: SlotWithRoom) => {
        setSelectedRoom(slotWithRoom.room);
        setSelectedSlot(slotWithRoom);
        setShowBuildPicker(false);
    };
    
    const handleRemoveRoom = () => {
        if (selectedSlot) {
            const removedType = selectedSlot.roomType;
            setSlotData(prev => {
                const newSlots = prev.map(s => 
                    s.slotId === selectedSlot.slotId 
                        ? { ...s, roomType: null, level: 1, occupant: undefined }
                        : s
                );
                // If no other slot still has this room type, unassign its roles
                if (removedType) {
                    const stillExists = newSlots.some(s => s.roomType === removedType);
                    if (!stillExists) {
                        stage().unassignRolesForRoomType(removedType);
                    }
                }
                return newSlots;
            });
            setShowRemoveConfirm(false);
            // Update selection to show it's now empty
            const emptyRoom = createRoom(null);
            setSelectedRoom(emptyRoom);
            setSelectedSlot({ ...selectedSlot, roomType: null, room: emptyRoom });
        }
    };

    const handleBuildRoom = (roomType: string) => {
        if (selectedSlot) {
            const s = stage();
            const st = s.currentState;
            const inventory = st.inventory || {};

            // Deduct gold + materials
            const cost = getRoomBuildCost(roomType, 1);
            if (cost) {
                if (!canAffordRoom(roomType, 1, st.stats.gold, inventory)) return;
                st.stats.gold = deductRoomCost(roomType, 1, st.stats.gold, inventory);
            }

            setSlotData(prev => prev.map(slot =>
                slot.slotId === selectedSlot.slotId
                    ? { ...slot, roomType, level: 1, occupant: undefined }
                    : slot
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
                    {import.meta.env.MODE === 'development' && (
                    <button 
                        className={`floor-button layout-editor-toggle ${layoutEditorOpen ? 'active' : ''}`}
                        onClick={() => {
                            if (!layoutEditorOpen) {
                                // Initialise editor slots from current defaults
                                setLayoutEditorSlots(getDefaultSlots());
                            }
                            setLayoutEditorOpen(!layoutEditorOpen);
                        }}
                        title="Toggle Layout Editor (dev tool)"
                    >
                        ⚙ Layout
                    </button>
                    )}
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
                        <div className="info-value"><GameIcon icon="wrench" size={12} className="icon-gold" /> {totalUpkeep} gold/day</div>
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
                                        <div className="room-occupant"><GameIcon icon="user" size={12} /> {slotWithRoom.room.occupant}</div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    </div>

                    {/* Layout Editor drag handles on blueprint */}
                    {layoutEditorOpen && layoutEditorSlots && (
                        <LayoutEditorHandles
                            slots={layoutEditorSlots}
                            currentFloor={currentFloor}
                            blueprintRef={blueprintContainerRef}
                            onSlotsChange={setLayoutEditorSlots}
                            selectedSlotId={leSelectedSlotId}
                            setSelectedSlotId={setLeSelectedSlotId}
                        />
                    )}
                </div>

                {/* Right panel: Layout Editor panel OR Room Detail panel */}
                {layoutEditorOpen && layoutEditorSlots ? (
                    <LayoutEditorPanel
                        slots={layoutEditorSlots}
                        currentFloor={currentFloor}
                        blueprintRef={blueprintContainerRef}
                        onSlotsChange={setLayoutEditorSlots}
                        onClose={() => setLayoutEditorOpen(false)}
                        onRoomTypeChange={(slotId, roomType) => {
                            setSlotData(prev => prev.map(s =>
                                s.slotId === slotId
                                    ? { ...s, roomType, level: roomType ? 1 : undefined, occupant: undefined }
                                    : s
                            ));
                        }}
                        selectedSlotId={leSelectedSlotId}
                        setSelectedSlotId={setLeSelectedSlotId}
                    />
                ) : (
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
                                                    <span className="stat-label"><GameIcon icon="map-pin" size={12} /> Location:</span>
                                                    <span className="stat-value">
                                                        {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                                    </span>
                                                </div>
                                                <div className="stat-row">
                                                    <span className="stat-label"><GameIcon icon="tag" size={12} /> Type:</span>
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
                                            <GameIcon icon="hammer" size={12} /> Build Room
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="room-detail-scrollable">
                                        <div className="room-detail-header">
                                            <div className="room-header-left">
                                                <h3>{selectedRoom.name}</h3>
                                                <div className="room-badges">
                                                    <span className="room-type-badge">{selectedRoom.type.replace('_', ' ')}</span>
                                                    <span className={`room-location-badge ${selectedRoom.location}`}>{selectedRoom.location}</span>
                                                </div>
                                            </div>
                                            <div className="room-header-actions">
                                                <button className="header-action-btn upgrade" title="Upgrade"><img src={IconPlus} alt="Upgrade" /></button>
                                                <button className="header-action-btn enter" title="Enter"><img src={IconChat} alt="Enter" /></button>
                                                {selectedRoom.buildable && (
                                                    <button 
                                                        className="header-action-btn remove" 
                                                        title="Remove"
                                                        onClick={() => setShowRemoveConfirm(true)}
                                                    ><img src={IconCross} alt="Remove" /></button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="room-preview-image" style={{ backgroundImage: `url(${selectedRoom.image})` }}></div>
                                        
                                        <div className="room-detail-content">
                                            <p className="room-description">{selectedRoom.description}</p>
                                            
                                            <div className="room-stats">
                                                <div className="stat-row">
                                                    <span className="stat-label"><GameIcon icon="map-pin" size={12} /> Location:</span>
                                                    <span className="stat-value">
                                                        {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                                    </span>
                                                </div>
                                                <div className="stat-row">
                                                    <span className="stat-label"><GameIcon icon="star" size={12} className="icon-gold" /> Level:</span>
                                                    <span className="stat-value">{selectedRoom.level}</span>
                                                </div>
                                                {selectedRoom.occupant && (
                                                    <div className="stat-row">
                                                        <span className="stat-label"><GameIcon icon="user" size={12} /> Occupant:</span>
                                                        <span className="stat-value">{selectedRoom.occupant}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="room-effects">
                                                <h4>Room Effects</h4>
                                                {selectedRoom.getEffects().length > 0 ? (
                                                    selectedRoom.getEffects().map((effect, i) => (
                                                        <div key={i} className="effect-item">
                                                            <span className="effect-icon"><GameIcon icon={effect.icon} size={12} /></span>
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
                                                        <span><GameIcon icon="wrench" size={12} className="icon-gold" /> {selectedRoom.getUpkeep()} gold/day</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(() => {
                                                const nextLevel = (selectedRoom.level || 1) + 1;
                                                const upgradeCost = getRoomBuildCost(selectedRoom.type, nextLevel);
                                                const st = stage().currentState;
                                                const inv = st.inventory || {};
                                                if (nextLevel > 3) return (
                                                    <div className="upgrade-info">
                                                        <h4>Max Level</h4>
                                                        <div className="upgrade-cost">
                                                            <span className="upgrade-maxed">This room is fully upgraded.</span>
                                                        </div>
                                                    </div>
                                                );
                                                return (
                                                    <div className="upgrade-info">
                                                        <h4>Upgrade to Lv.{nextLevel}</h4>
                                                        {upgradeCost ? (
                                                            <div className="upgrade-cost-list">
                                                                <div className={`upgrade-cost-row ${st.stats.gold < upgradeCost.gold ? 'cost-missing' : ''}`}>
                                                                    <GameIcon icon="coins" size={12} className="icon-gold" />
                                                                    <span>Gold: {st.stats.gold}/{upgradeCost.gold}</span>
                                                                </div>
                                                                {upgradeCost.materials.map(mat => {
                                                                    const have = inv[mat.itemName]?.quantity ?? 0;
                                                                    return (
                                                                        <div key={mat.itemName} className={`upgrade-cost-row ${have < mat.quantity ? 'cost-missing' : ''}`}>
                                                                            <GameIcon icon="hammer" size={12} />
                                                                            <span>{mat.itemName}: {have}/{mat.quantity}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="upgrade-cost">
                                                                <span><GameIcon icon="diamond" size={12} className="icon-blue" /> Cost: {selectedRoom.getUpgradeCost()} Gold</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {selectedRoom.getActions().length > 0 && (
                                        <div className="room-actions">
                                            {selectedRoom.getActions().map((action, i) => (
                                                <button key={i} className="action-button">
                                                    <GameIcon icon={action.icon} size={14} /> {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="no-room-selected">
                            <div className="placeholder-icon"><GameIcon icon="home" size={24} className="icon-muted" /></div>
                            <p>Select a room to view details</p>
                        </div>
                    )}
                </div>
                )}
            </div>
            
            {/* Room Catalogue Overlay */}
            {showBuildPicker && selectedSlot && (() => {
                const buildableRooms = getBuildableRoomTypes(getFloorBuildZone(selectedSlot.floor));
                const preview = catalogueSelection || buildableRooms[0] || null;
                return (
                    <div className="catalogue-overlay" onClick={() => { setShowBuildPicker(false); setCatalogueSelection(null); }}>
                        <div className="catalogue-panel" onClick={e => e.stopPropagation()}>
                            <div className="catalogue-header">
                                <h3>Room Catalogue</h3>
                                <span className="catalogue-slot-badge">
                                    {selectedSlot.floor === '1st' ? '1st Floor' : selectedSlot.floor === '2nd' ? '2nd Floor' : selectedSlot.floor === 'basement' ? 'Basement' : 'Outside'}
                                </span>
                                <button className="catalogue-close" onClick={() => { setShowBuildPicker(false); setCatalogueSelection(null); }}><GameIcon icon="x" size={14} /></button>
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
                                                        <span className="catalogue-detail-label"><GameIcon icon={effect.icon} size={12} /> {effect.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {(() => {
                                                const buildCost = getRoomBuildCost(preview.type, 1);
                                                const st = stage().currentState;
                                                const inv = st.inventory || {};
                                                const affordable = buildCost ? canAffordRoom(preview.type, 1, st.stats.gold, inv) : true;
                                                const missing = buildCost ? getMissingMaterials(preview.type, 1, inv) : [];
                                                const goldShort = buildCost ? st.stats.gold < buildCost.gold : false;
                                                return (
                                                    <>
                                                        <div className="catalogue-detail-section">
                                                            <h4>Build Cost</h4>
                                                            {buildCost && (
                                                                <>
                                                                    <div className={`catalogue-detail-row ${goldShort ? 'cost-missing' : ''}`}>
                                                                        <span className="catalogue-detail-label"><GameIcon icon="coins" size={12} className="icon-gold" /> Gold</span>
                                                                        <span className="catalogue-detail-value">{st.stats.gold}/{buildCost.gold}</span>
                                                                    </div>
                                                                    {buildCost.materials.map(mat => {
                                                                        const have = inv[mat.itemName]?.quantity ?? 0;
                                                                        const short = have < mat.quantity;
                                                                        return (
                                                                            <div key={mat.itemName} className={`catalogue-detail-row ${short ? 'cost-missing' : ''}`}>
                                                                                <span className="catalogue-detail-label"><GameIcon icon="hammer" size={12} /> {mat.itemName}</span>
                                                                                <span className="catalogue-detail-value">{have}/{mat.quantity}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </>
                                                            )}
                                                            {!buildCost && (
                                                                <div className="catalogue-detail-row">
                                                                    <span className="catalogue-detail-label">No build cost data</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="catalogue-detail-section">
                                                            <div className="catalogue-detail-row">
                                                                <span className="catalogue-detail-label"><GameIcon icon="wrench" size={12} className="icon-gold" /> Upkeep</span>
                                                                <span className="catalogue-detail-value">{preview.getUpkeep()} gold/day</span>
                                                            </div>
                                                            <div className="catalogue-detail-row">
                                                                <span className="catalogue-detail-label"><GameIcon icon="map-pin" size={12} /> Placement</span>
                                                                <span className="catalogue-detail-value">{preview.location}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {(() => {
                                            const buildCost = getRoomBuildCost(preview.type, 1);
                                            const st = stage().currentState;
                                            const affordable = buildCost ? canAffordRoom(preview.type, 1, st.stats.gold, st.inventory || {}) : true;
                                            return (
                                                <button
                                                    className={`catalogue-build-btn ${!affordable ? 'catalogue-build-btn--disabled' : ''}`}
                                                    onClick={() => { if (affordable) { handleBuildRoom(preview.type); setCatalogueSelection(null); } }}
                                                    disabled={!affordable}
                                                >
                                                    <GameIcon icon="hammer" size={12} /> {affordable ? `Build ${preview.name}` : 'Missing Resources'}
                                                </button>
                                            );
                                        })()}
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
                        <h3>alert-triangle Remove Room?</h3>
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
