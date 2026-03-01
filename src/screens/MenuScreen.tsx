import React, { FC, useState } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import { GameIcon } from './GameIcon';
import { GrimoireBook } from './GrimoireBook';

interface MenuScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    endDay: () => void;
}

export const MenuScreen: FC<MenuScreenProps> = ({ stage, setScreenType, endDay }) => {
    const [showGrimoire, setShowGrimoire] = useState(false);

    const st = stage().currentState.stats;

    /* ─── Navigation groups ─── */
    const personalOptions = [
        { label: 'Profile', icon: 'wand', screen: ScreenType.PC_PROFILE, desc: 'Your skills & stats' },
        { label: 'Grimoire', icon: 'book-open', screen: null as any, desc: 'Spells & rituals' },
    ];

    const manorOptions = [
        { label: 'Manor', icon: 'castle', screen: ScreenType.MANOR, desc: 'Manage your estate' },
        { label: 'Servants', icon: 'users', screen: ScreenType.SERVANTS, desc: 'Loyal attendants' },
        { label: 'Captives', icon: 'link', screen: ScreenType.CAPTIVES, desc: 'Held prisoners' },
        { label: 'Inventory', icon: 'backpack', screen: ScreenType.INVENTORY, desc: 'Equipment & items' },
    ];

    const worldOptions = [
        { label: 'World Map', icon: 'map', screen: ScreenType.WORLD_MAP, desc: 'Explore the realm' },
        { label: 'Heroes', icon: 'target', screen: ScreenType.HEROES, desc: 'Known adventurers' },
        { label: 'Quests', icon: 'scroll', screen: ScreenType.QUESTS, desc: 'Active questlines' },
    ];

    return (
        <div className="hub-screen">
            {/* Header bar */}
            <div className="hub-header">
                <button className="hub-back-btn" onClick={() => setScreenType(ScreenType.START_MENU)}>
                    <GameIcon icon="chevron-left" size={10} />
                    <span>Title</span>
                </button>
                <div className="hub-day-badge">
                    <GameIcon icon="moon" size={10} className="hub-day-icon" />
                    Day {st.day}
                </div>
            </div>

            {/* Hub content */}
            <div className="hub-content">
                {/* Section: Personal */}
                <div className="hub-section">
                    <div className="hub-section-label">
                        <GameIcon icon="wand" size={8} className="hub-section-icon" />
                        The Witch
                    </div>
                    <div className="hub-grid">
                        {personalOptions.map((opt) => (
                            <button key={opt.label} className="hub-tile" onClick={() => opt.screen ? setScreenType(opt.screen) : setShowGrimoire(true)}>
                                <div className="hub-tile-icon-wrap">
                                    <GameIcon icon={opt.icon} size={18} className="hub-tile-icon" />
                                </div>
                                <div className="hub-tile-text">
                                    <span className="hub-tile-label">{opt.label}</span>
                                    <span className="hub-tile-desc">{opt.desc}</span>
                                    {opt.label === 'Grimoire' && (
                                        <span className="hub-tile-badge">
                                            <GameIcon icon="sparkles" size={8} className="icon-mana" />
                                            {st.mana}/{st.maxMana}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Manor */}
                <div className="hub-section">
                    <div className="hub-section-label">
                        <GameIcon icon="castle" size={8} className="hub-section-icon" />
                        The Manor
                    </div>
                    <div className="hub-grid">
                        {manorOptions.map((opt) => (
                            <button key={opt.screen} className="hub-tile" onClick={() => setScreenType(opt.screen)}>
                                <div className="hub-tile-icon-wrap">
                                    <GameIcon icon={opt.icon} size={18} className="hub-tile-icon" />
                                </div>
                                <div className="hub-tile-text">
                                    <span className="hub-tile-label">{opt.label}</span>
                                    <span className="hub-tile-desc">{opt.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: World */}
                <div className="hub-section">
                    <div className="hub-section-label">
                        <GameIcon icon="map" size={8} className="hub-section-icon" />
                        The World
                    </div>
                    <div className="hub-grid">
                        {worldOptions.map((opt) => (
                            <button key={opt.screen} className="hub-tile" onClick={() => setScreenType(opt.screen)}>
                                <div className="hub-tile-icon-wrap">
                                    <GameIcon icon={opt.icon} size={18} className="hub-tile-icon" />
                                </div>
                                <div className="hub-tile-text">
                                    <span className="hub-tile-label">{opt.label}</span>
                                    <span className="hub-tile-desc">{opt.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Special actions */}
                <div className="hub-actions">
                    <button className="menu-end-day-btn" onClick={endDay}>
                        <GameIcon icon="sunset" size={18} className="end-day-icon" />
                        End Day
                        <span className="end-day-counter">Day {st.day}</span>
                    </button>
                </div>
            </div>

            {/* Grimoire overlay */}
            {showGrimoire && (
                <GrimoireBook stage={stage} onClose={() => setShowGrimoire(false)} />
            )}
        </div>
    );
};


