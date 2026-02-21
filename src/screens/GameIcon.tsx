import React, { FC } from 'react';
import {
    // Combat & Stats
    Swords, Wrench, Sparkles, Crown, Target, Search,
    // Roles & Characters
    UserRound, Leaf, ChefHat, Paintbrush, FlaskConical, BookOpen,
    BedDouble, Package, Link2, Lock, Armchair,
    // Rooms & Effects
    Moon, ClipboardList, Eye as EyeIcon, Skull, Brain, Heart,
    BookCopy, GraduationCap, Beef, Dumbbell, CookingPot,
    MessageCircle, TestTubes, Wind, Dna, Frown,
    Sparkle, Ban, User, MapPin, Tag, Hammer, Star,
    Gem, Home, AlertTriangle, X, Check,
    // UI Actions
    Hourglass, Unlock, Settings, PlusCircle, Save, FolderOpen,
    Trash2, XCircle, Wand2, Castle, Map, Backpack, Key, Coins,
    HelpCircle, Image, Flower2, ChevronLeft, RefreshCw, Infinity,
    Diamond, ArrowLeftRight, Users, Zap, CircleDot,
    // Scene
    Footprints, ShieldAlert, HeartCrack, LockKeyhole, Orbit,
} from 'lucide-react';

/** Master icon map: string key → lucide component */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string; color?: string }>> = {
    // ── Stats ──
    swords: Swords,
    wrench: Wrench,
    sparkles: Sparkles,
    crown: Crown,
    target: Target,
    search: Search,

    // ── Role Icons ──
    'user-round': UserRound,
    leaf: Leaf,
    'chef-hat': ChefHat,
    paintbrush: Paintbrush,
    flask: FlaskConical,
    'book-open': BookOpen,
    'bed-double': BedDouble,
    pentagram: Sparkles,
    package: Package,
    link: Link2,
    lock: Lock,
    armchair: Armchair,

    // ── Room Effects ──
    moon: Moon,
    'clipboard-list': ClipboardList,
    eye: EyeIcon,
    skull: Skull,
    brain: Brain,
    heart: Heart,
    'heart-crack': HeartCrack,
    'book-copy': BookCopy,
    'graduation-cap': GraduationCap,
    beef: Beef,
    dumbbell: Dumbbell,
    'cooking-pot': CookingPot,
    'message-circle': MessageCircle,
    'test-tubes': TestTubes,
    wind: Wind,
    dna: Dna,
    frown: Frown,
    sparkle: Sparkle,
    ban: Ban,
    user: User,
    'map-pin': MapPin,
    tag: Tag,
    hammer: Hammer,
    star: Star,
    gem: Gem,
    home: Home,
    'alert-triangle': AlertTriangle,
    x: X,
    check: Check,

    // ── UI Actions ──
    hourglass: Hourglass,
    unlock: Unlock,
    settings: Settings,
    'plus-circle': PlusCircle,
    save: Save,
    'folder-open': FolderOpen,
    'trash-2': Trash2,
    'x-circle': XCircle,
    wand: Wand2,
    castle: Castle,
    map: Map,
    backpack: Backpack,
    key: Key,
    coins: Coins,
    'help-circle': HelpCircle,
    image: Image,
    flower: Flower2,
    'chevron-left': ChevronLeft,
    'refresh-cw': RefreshCw,
    infinity: Infinity,
    diamond: Diamond,
    'arrow-left-right': ArrowLeftRight,
    users: Users,
    zap: Zap,
    'circle-dot': CircleDot,
    orbit: Orbit,

    // ── Scene / Special ──
    footprints: Footprints,
    'shield-alert': ShieldAlert,
    'lock-keyhole': LockKeyhole,
};

export interface GameIconProps {
    icon: string;
    size?: number;
    className?: string;
    color?: string;
}

export const GameIcon: FC<GameIconProps> = ({ icon, size = 14, className = '', color }) => {
    const IconComponent = ICON_MAP[icon];
    if (IconComponent) {
        return <IconComponent size={size} className={`game-icon ${className}`} color={color} />;
    }
    // Fallback: render the raw string (shouldn't happen if all icons are mapped)
    return <span className={`game-icon-fallback ${className}`} style={{ fontSize: size, color }}>{icon}</span>;
};

export default GameIcon;
