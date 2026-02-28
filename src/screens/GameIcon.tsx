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
    Diamond, ArrowLeftRight, Users, Zap, CircleDot, Pencil,
    // Scene
    Footprints, ShieldAlert, HeartCrack, LockKeyhole, Orbit, Flame,
    // Conversion & Archetypes
    List, ScrollText, Shield, ScanEye, Ghost,
    // Extra spell icons
    Music, Cloud, Waves, Hand, Droplets, Sun, Feather,
    // Task icons
    Utensils, PawPrint, Wine, ShoppingBag, Trees, Compass,
    Drama, Building, ListTodo, Clock, ChevronDown, ChevronRight,
    TrendingUp, ShieldPlus,
    // Item Library icons
    Sprout, Droplet, Square, Circle, Smile, Layers,
    RectangleHorizontal, Lightbulb, CircleDashed, Hexagon,
    EyeOff, Shirt, Medal, Plus, HeartHandshake, Book,
    // New thematic icons
    Anvil, Eclipse, MoonStar, Beaker, FlaskRound, Pipette,
    Clover, Shrub, Wheat, Snowflake,
    Sword, Axe, ShieldHalf, Trophy, BadgeCheck, Gift, Ribbon,
    BrickWall, Columns, Lamp, LampCeiling, Landmark,
    Amphora, Box, Archive, Scissors, Scale, Bomb,
    Lasso, Unlink, Fingerprint, Crosshair, Grab, HandMetal,
    Telescope, Stars, Atom, Glasses, Globe,
    Shell, Bone, TreePine, Mountain, Tent,
    Church, HeartPulse, Microscope, Handshake,
    // Circus / Carnival icons
    Candy, Dices, Disc, RectangleVertical, Ticket, VenetianMask, WandSparkles,
    // Turn system icons
    Sunrise, Sunset, CheckCircle, Sofa, ArrowUp, ArrowDown,
    // Start menu
    Play,
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
    flame: Flame,
    pencil: Pencil,

    // ── Scene / Special ──
    footprints: Footprints,
    'shield-alert': ShieldAlert,
    'lock-keyhole': LockKeyhole,

    // ── Conversion & Archetypes ──
    list: List,
    scroll: ScrollText,
    shield: Shield,
    'scan-eye': ScanEye,
    ghost: Ghost,

    // ── Extra Spell Icons ──
    music: Music,
    cloud: Cloud,
    waves: Waves,
    hand: Hand,
    droplets: Droplets,
    sun: Sun,
    feather: Feather,

    // ── Task Icons ──
    utensils: Utensils,
    'flask-conical': FlaskConical,
    'scroll-text': ScrollText,
    'paw-print': PawPrint,
    wine: Wine,
    'shopping-bag': ShoppingBag,
    trees: Trees,
    compass: Compass,
    drama: Drama,
    building: Building,
    'list-todo': ListTodo,
    clock: Clock,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    'trending-up': TrendingUp,
    'shield-plus': ShieldPlus,

    // ── Item Library Icons ──
    'flower-2': Flower2,
    'link-2': Link2,
    book: Book,
    plant: Sprout,
    droplet: Droplet,
    square: Square,
    circle: Circle,
    smile: Smile,
    layers: Layers,
    rectangle: RectangleHorizontal,
    'light-bulb': Lightbulb,
    'circle-dashed': CircleDashed,
    hexagon: Hexagon,
    'eye-off': EyeOff,
    coat: Shirt,
    badge: Medal,
    cross: Plus,
    hearts: HeartHandshake,
    bottle: Wine,
    ring: CircleDot,

    // ── New Thematic Icons ──
    anvil: Anvil,
    spiral: Orbit,
    eclipse: Eclipse,
    'moon-star': MoonStar,
    beaker: Beaker,
    'flask-round': FlaskRound,
    pipette: Pipette,
    clover: Clover,
    shrub: Shrub,
    wheat: Wheat,
    snowflake: Snowflake,
    sword: Sword,
    axe: Axe,
    'shield-half': ShieldHalf,
    trophy: Trophy,
    'badge-check': BadgeCheck,
    gift: Gift,
    ribbon: Ribbon,
    'brick-wall': BrickWall,
    columns: Columns,
    lamp: Lamp,
    lantern: LampCeiling,
    landmark: Landmark,
    amphora: Amphora,
    box: Box,
    archive: Archive,
    scissors: Scissors,
    scale: Scale,
    bomb: Bomb,
    lasso: Lasso,
    unlink: Unlink,
    fingerprint: Fingerprint,
    crosshair: Crosshair,
    grab: Grab,
    'hand-metal': HandMetal,
    telescope: Telescope,
    stars: Stars,
    atom: Atom,
    glasses: Glasses,
    globe: Globe,
    shell: Shell,
    bone: Bone,
    'tree-pine': TreePine,
    mountain: Mountain,
    tent: Tent,
    church: Church,
    'heart-pulse': HeartPulse,
    microscope: Microscope,
    handshake: Handshake,
    lightbulb: Lightbulb,

    // ── Circus / Carnival ──
    candy: Candy,
    dices: Dices,
    disc: Disc,
    'rectangle-vertical': RectangleVertical,
    ticket: Ticket,
    'venetian-mask': VenetianMask,
    'wand-sparkles': WandSparkles,

    // ── Turn System ──
    sunrise: Sunrise,
    sunset: Sunset,
    'check-circle': CheckCircle,
    sofa: Sofa,
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,
    play: Play,
};

export interface GameIconProps {
    icon: string;
    size?: number;
    className?: string;
    color?: string;
    /** Override the composite overlay position (e.g. force 'br' in inventory grids) */
    overlayPos?: 'tr' | 'tl' | 'br' | 'bl' | 'center';
}

/**
 * Composite icon definitions: "base+overlay" syntax.
 * Each entry maps a composite key to { base, overlay, overlayPos, overlayScale, overlayColor? }.
 */
interface CompositeIconDef {
    base: string;
    overlay: string;
    /** Position of the overlay: 'tr' (top-right), 'bl' (bottom-left), 'br', 'tl', 'center' */
    pos: 'tr' | 'bl' | 'br' | 'tl' | 'center';
    /** Overlay size as fraction of base (0.35–0.55 typical) */
    scale: number;
    /** Optional fixed color for the overlay */
    overlayColor?: string;
}

const COMPOSITE_ICONS: Record<string, CompositeIconDef> = {
    // Conditioning tools
    'pendant-spiral':    { base: 'gem',         overlay: 'spiral',    pos: 'br', scale: 0.45, overlayColor: '#c8aa6e' },
    'visor-eye':         { base: 'glasses',     overlay: 'spiral',    pos: 'center', scale: 0.4, overlayColor: '#f0a830' },
    'collar-lock':       { base: 'circle-dot',  overlay: 'lock',      pos: 'br', scale: 0.45 },
    'shackles-chain':    { base: 'link',        overlay: 'sparkle',   pos: 'tr', scale: 0.4, overlayColor: '#b882ff' },
    'memory-shard':      { base: 'brain',       overlay: 'sparkle',   pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },

    // Herbs
    'herb-dream':        { base: 'leaf',        overlay: 'moon',      pos: 'tr', scale: 0.4, overlayColor: '#a0c0f0' },
    'herb-moon':         { base: 'flower-2',    overlay: 'moon-star', pos: 'tr', scale: 0.4, overlayColor: '#c0c0e0' },
    'herb-honey':        { base: 'flower',      overlay: 'heart',     pos: 'tr', scale: 0.35, overlayColor: '#f0c060' },
    'herb-nightshade':   { base: 'skull',       overlay: 'leaf',      pos: 'bl', scale: 0.4, overlayColor: '#90e090' },
    'herb-mistletoe':    { base: 'clover',      overlay: 'link',      pos: 'br', scale: 0.4, overlayColor: '#c0a0e0' },
    'herb-frost':        { base: 'snowflake',   overlay: 'shrub',     pos: 'bl', scale: 0.4, overlayColor: '#70b070' },

    // Crystals & Minerals
    'crystal-mana':      { base: 'diamond',     overlay: 'zap',       pos: 'tr', scale: 0.4, overlayColor: '#70b0ff' },
    'crystal-amethyst':  { base: 'gem',         overlay: 'sparkle',   pos: 'tr', scale: 0.4, overlayColor: '#b882ff' },
    'dust-rose':         { base: 'sparkles',    overlay: 'heart',     pos: 'bl', scale: 0.35, overlayColor: '#ff90b0' },
    'crystal-sapphire':  { base: 'gem',         overlay: 'shield',    pos: 'br', scale: 0.4, overlayColor: '#5b9bd5' },
    'powder-obsidian':   { base: 'circle',      overlay: 'skull',     pos: 'center', scale: 0.5 },
    'crystal-moonstone': { base: 'gem',         overlay: 'moon',      pos: 'tr', scale: 0.4, overlayColor: '#c0d0f0' },
    'ash-phoenix':       { base: 'flame',       overlay: 'feather',   pos: 'tl', scale: 0.4, overlayColor: '#f0d060' },
    'powder-dragon':     { base: 'zap',         overlay: 'shield',    pos: 'br', scale: 0.4, overlayColor: '#f0a830' },
    'tear-siren':        { base: 'droplets',    overlay: 'music',     pos: 'tr', scale: 0.4, overlayColor: '#80d0f0' },
    'essence-wraith':    { base: 'ghost',       overlay: 'flask',     pos: 'br', scale: 0.45, overlayColor: '#b882ff' },

    // Potions (flask + effect overlay)
    'potion-obedience':  { base: 'flask-round', overlay: 'spiral',    pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },
    'incense-spiral':    { base: 'wind',        overlay: 'spiral',    pos: 'center', scale: 0.45, overlayColor: '#c8aa6e' },
    'potion-binding':    { base: 'beaker',      overlay: 'link',      pos: 'tr', scale: 0.4, overlayColor: '#70b0ff' },
    'potion-thrall':     { base: 'flask-round', overlay: 'crown',     pos: 'tr', scale: 0.4, overlayColor: '#d55b5b' },
    'potion-domination': { base: 'flask-round', overlay: 'crosshair', pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },
    'potion-sweet':      { base: 'beaker',      overlay: 'heart',     pos: 'tr', scale: 0.4, overlayColor: '#ff90b0' },
    'potion-admire':     { base: 'flask-round', overlay: 'hearts',    pos: 'tr', scale: 0.4, overlayColor: '#f0a0c0' },
    'potion-devotion':   { base: 'flask-round', overlay: 'stars',     pos: 'tr', scale: 0.4, overlayColor: '#f0d060' },
    'potion-clarity':    { base: 'beaker',      overlay: 'eye',       pos: 'tr', scale: 0.4, overlayColor: '#70d0ff' },
    'potion-vigor':      { base: 'beaker',      overlay: 'zap',       pos: 'tr', scale: 0.4, overlayColor: '#ff6050' },
    'potion-charm':      { base: 'flask-round', overlay: 'smile',     pos: 'tr', scale: 0.4, overlayColor: '#f0c0d0' },

    // Manor materials
    'mat-stone':         { base: 'brick-wall',  overlay: 'box',       pos: 'br', scale: 0.35 },
    'mat-wood':          { base: 'tree-pine',   overlay: 'axe',       pos: 'br', scale: 0.4 },
    'mat-iron':          { base: 'anvil',       overlay: 'columns',   pos: 'tr', scale: 0.35 },
    'mat-marble':        { base: 'landmark',    overlay: 'sparkle',   pos: 'tr', scale: 0.35, overlayColor: '#e0e0f0' },
    'mat-obsidian-tile': { base: 'square',      overlay: 'eclipse',   pos: 'center', scale: 0.5, overlayColor: '#b882ff' },
    'mat-velvet':        { base: 'layers',      overlay: 'ribbon',    pos: 'tr', scale: 0.4, overlayColor: '#d070a0' },
    'mat-silk':          { base: 'rectangle',   overlay: 'sparkles',  pos: 'tr', scale: 0.35, overlayColor: '#e0c090' },
    'chandelier':        { base: 'lamp',        overlay: 'gem',       pos: 'bl', scale: 0.35, overlayColor: '#e0e0f0' },
    'mirror-enchanted':  { base: 'scan-eye',    overlay: 'sparkle',   pos: 'tr', scale: 0.35, overlayColor: '#b882ff' },
    'chalk-circle':      { base: 'circle-dashed', overlay: 'sparkle', pos: 'center', scale: 0.4, overlayColor: '#e0e0f0' },

    // Equipment
    'robe-mystic':       { base: 'coat',        overlay: 'stars',     pos: 'tr', scale: 0.4, overlayColor: '#b882ff' },
    'ring-enchanted':    { base: 'ring',        overlay: 'sparkle',   pos: 'tr', scale: 0.4, overlayColor: '#70b0ff' },
    'amulet-influence':  { base: 'gem',         overlay: 'hand-metal', pos: 'br', scale: 0.4, overlayColor: '#f0a830' },
    'blindfold-silk':    { base: 'eye-off',     overlay: 'ribbon',    pos: 'bl', scale: 0.35, overlayColor: '#d070a0' },

    // Rewards
    'gem-treasure':      { base: 'gem',         overlay: 'coins',     pos: 'br', scale: 0.4, overlayColor: '#f0d060' },
    'relic-ancient':     { base: 'amphora',     overlay: 'star',      pos: 'tr', scale: 0.35, overlayColor: '#f0a830' },
    'jewelry-enchanted': { base: 'gem',         overlay: 'wand',      pos: 'bl', scale: 0.4, overlayColor: '#b882ff' },
    'tome-fragment':     { base: 'book-open',   overlay: 'scissors',  pos: 'br', scale: 0.35 },
    'badge-adventurer':  { base: 'shield',      overlay: 'sword',     pos: 'center', scale: 0.5 },
    'talisman-magic':    { base: 'wand',        overlay: 'sparkles',  pos: 'tr', scale: 0.4, overlayColor: '#f0d060' },
    'ring-heir':         { base: 'ring',        overlay: 'crown',     pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },

    // Consumables
    'salve-heal':        { base: 'cross',       overlay: 'droplet',   pos: 'bl', scale: 0.35, overlayColor: '#5dba5d' },
    'draught-stamina':   { base: 'zap',         overlay: 'flask',     pos: 'bl', scale: 0.4, overlayColor: '#ff5040' },
    'charm-luck':        { base: 'clover',      overlay: 'star',      pos: 'tr', scale: 0.4, overlayColor: '#f0d060' },
    'antidote-bottle':   { base: 'bottle',      overlay: 'shield',    pos: 'tr', scale: 0.35, overlayColor: '#5dba5d' },
    'scroll-summon':     { base: 'scroll',      overlay: 'sparkles',  pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },

    // Currency
    'gold-coins':        { base: 'coins',       overlay: 'sparkle',   pos: 'tr', scale: 0.3, overlayColor: '#f0d060' },

    // Circus goods
    'card-fate':         { base: 'rectangle-vertical', overlay: 'sparkle', pos: 'tr', scale: 0.4, overlayColor: '#b882ff' },
    'ball-crystal':      { base: 'circle',      overlay: 'eye',       pos: 'center', scale: 0.5, overlayColor: '#a0c0f0' },
    'pendulum-mesmer':   { base: 'disc',        overlay: 'spiral',    pos: 'br', scale: 0.4, overlayColor: '#c8aa6e' },
    'smoke-stage':       { base: 'cloud',       overlay: 'sparkle',   pos: 'tr', scale: 0.35, overlayColor: '#f0d060' },
    'wine-hypnotic':     { base: 'wine',        overlay: 'spiral',    pos: 'tr', scale: 0.4, overlayColor: '#c8aa6e' },
    'candy-trance':      { base: 'candy',       overlay: 'moon',      pos: 'tr', scale: 0.35, overlayColor: '#c0c0e0' },
    'candle-mindfog':    { base: 'flame',       overlay: 'cloud',     pos: 'bl', scale: 0.4, overlayColor: '#b882ff' },
    'mask-masquerade':   { base: 'venetian-mask', overlay: 'sparkles', pos: 'tr', scale: 0.35, overlayColor: '#f0a830' },
    'baton-ringmaster':  { base: 'wand-sparkles', overlay: 'crown',   pos: 'tr', scale: 0.4, overlayColor: '#f0a830' },
    'bones-fortune':     { base: 'dices',       overlay: 'moon-star', pos: 'tr', scale: 0.35, overlayColor: '#c0c0e0' },
    'dust-illusionist':  { base: 'sparkles',    overlay: 'eye',       pos: 'bl', scale: 0.4, overlayColor: '#a0c0f0' },
    'voucher-carnival':  { base: 'ticket',      overlay: 'star',      pos: 'tr', scale: 0.35, overlayColor: '#f0d060' },
};

/** Position offsets for composite overlays (percentage of container) */
const POS_OFFSETS: Record<string, React.CSSProperties> = {
    tr: { top: 0, right: 0 },
    tl: { top: 0, left: 0 },
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

/** Type-based fallback colors for items without a composite overlay color */
const TYPE_ICON_COLORS: Record<string, string> = {
    equipment: '#c8aa6e',
    consumable: '#70b0ff',
    material: '#a0c0a0',
    key: '#f0d060',
    currency: '#f0d060',
};

/**
 * Returns an item-specific icon color based on its composite overlay color,
 * or falls back to a type-based color.
 */
export function getItemIconColor(iconKey: string, itemType?: string): string {
    const composite = COMPOSITE_ICONS[iconKey];
    if (composite?.overlayColor) return composite.overlayColor;
    if (itemType && TYPE_ICON_COLORS[itemType]) return TYPE_ICON_COLORS[itemType];
    return '#c8aa6e';
}

export const GameIcon: FC<GameIconProps> = ({ icon, size = 14, className = '', color, overlayPos }) => {
    // Check for composite icon first
    const composite = COMPOSITE_ICONS[icon];
    if (composite) {
        const BaseIcon = ICON_MAP[composite.base];
        const OverlayIcon = ICON_MAP[composite.overlay];
        if (BaseIcon && OverlayIcon) {
            const overlaySize = Math.round(size * composite.scale);
            const pos = POS_OFFSETS[overlayPos || composite.pos];
            return (
                <span
                    className={`game-icon game-icon-composite ${className}`}
                    style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: size,
                        height: size,
                    }}
                >
                    <BaseIcon size={Math.round(size * 0.8)} color={color} />
                    <span
                        className="game-icon-overlay"
                        style={{
                            position: 'absolute',
                            ...pos,
                            lineHeight: 0,
                            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.9)) drop-shadow(0 0 3px rgba(0,0,0,0.6))',
                        }}
                    >
                        <OverlayIcon size={overlaySize} color={composite.overlayColor || color} />
                    </span>
                </span>
            );
        }
    }

    // Simple icon lookup
    const IconComponent = ICON_MAP[icon];
    if (IconComponent) {
        return <IconComponent size={size} className={`game-icon ${className}`} color={color} />;
    }
    // Fallback: render the raw string (shouldn't happen if all icons are mapped)
    return <span className={`game-icon-fallback ${className}`} style={{ fontSize: size, color }}>{icon}</span>;
};

export default GameIcon;
