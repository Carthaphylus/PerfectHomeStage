import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import type { SaveFileSlot } from '../Stage';

// Skill icons
import PowerIcon from '../assets/Images/Stats/Power.webp';
import WisdomIcon from '../assets/Images/Stats/Wisdom.webp';
import CharmIcon from '../assets/Images/Stats/Charm.webp';
import SpeedIcon from '../assets/Images/Stats/Speed.webp';

// Resource icons
import GoldIcon from '../assets/Images/Resources/GoldIcon.png';
import ComfortIcon from '../assets/Images/Resources/HouseholdComfort.png';
import ObedienceIcon from '../assets/Images/Resources/HouseholdObedience.png';
import ServantsIcon from '../assets/Images/Resources/Servants.png';

interface MenuScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const MenuScreen: FC<MenuScreenProps> = ({ stage, setScreenType }) => {
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [saveMenuMode, setSaveMenuMode] = useState<'save' | 'load'>('save');
    const [saveSlots, setSaveSlots] = useState<(SaveFileSlot | null)[]>([]);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

    const menuOptions = [
        { label: '🏰 Manor', screen: ScreenType.MANOR },
        { label: '🗺️ World Map', screen: ScreenType.WORLD_MAP },
        { label: '🎯 Heroes', screen: ScreenType.HEROES },
        { label: '👥 Servants', screen: ScreenType.SERVANTS },
    ];

    const flashMessage = (msg: string) => {
        setSaveMessage(msg);
        setTimeout(() => setSaveMessage(null), 2500);
    };

    const openSaveMenu = (mode: 'save' | 'load') => {
        setSaveMenuMode(mode);
        setSaveSlots(stage().getSaveSlots());
        setShowSaveMenu(true);
    };

    const handleSaveToSlot = (slotIndex: number) => {
        const manorSlots = stage().getManorSlots();
        if (!manorSlots || manorSlots.length === 0) {
            flashMessage('❌ No manor data to save');
            return;
        }
        const builtCount = manorSlots.filter(s => s.roomType !== null).length;
        const name = `Manor (${builtCount} rooms)`;
        const ok = stage().saveToSlot(slotIndex, name, manorSlots);
        if (ok) {
            setSaveSlots(stage().getSaveSlots());
            flashMessage(`💾 Saved to Slot ${slotIndex + 1}!`);
        } else {
            flashMessage('❌ Save failed');
        }
    };

    const handleLoadFromSlot = (slotIndex: number) => {
        const saveFile = stage().loadFromSlot(slotIndex);
        if (!saveFile) {
            flashMessage('❌ Empty slot');
            return;
        }
        stage().syncManorSlots(saveFile.data);
        setShowSaveMenu(false);
        flashMessage(`📂 Loaded Slot ${slotIndex + 1}!`);
        setScreenType(ScreenType.MANOR);
    };

    const handleDeleteSlot = (slotIndex: number) => {
        stage().deleteSlot(slotIndex);
        setSaveSlots(stage().getSaveSlots());
        flashMessage(`🗑️ Slot ${slotIndex + 1} deleted`);
    };

    const handleNewGame = () => {
        stage().resetManor();
        setShowNewGameConfirm(false);
        setScreenType(ScreenType.MANOR);
    };

    const hasSaveData = !!stage().getManorSlots()?.length;

    return (
        <div className="menu-screen">
            <div className="menu-content">
                <h1 className="menu-title">Perfect Home</h1>
                <div className="menu-subtitle">The Witch's Domain</div>

                {/* Stats Dashboard */}
                <div className="menu-stats-card">
                    <div className="menu-stats-section">
                        <div className="menu-stats-label">Skills</div>
                        <div className="menu-stats-grid">
                            <div className="menu-stat">
                                <img src={PowerIcon} alt="Power" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Power</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.skills.power}</span>
                                </div>
                            </div>
                            <div className="menu-stat">
                                <img src={WisdomIcon} alt="Wisdom" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Wisdom</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.skills.wisdom}</span>
                                </div>
                            </div>
                            <div className="menu-stat">
                                <img src={CharmIcon} alt="Charm" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Charm</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.skills.charm}</span>
                                </div>
                            </div>
                            <div className="menu-stat">
                                <img src={SpeedIcon} alt="Speed" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Speed</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.skills.speed}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="menu-stats-divider" />

                    <div className="menu-stats-section">
                        <div className="menu-stats-label">Household</div>
                        <div className="menu-stats-grid two-col">
                            <div className="menu-stat">
                                <img src={ComfortIcon} alt="Comfort" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Comfort</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.household.comfort}</span>
                                </div>
                            </div>
                            <div className="menu-stat">
                                <img src={ObedienceIcon} alt="Obedience" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Obedience</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.household.obedience}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="menu-stats-divider" />

                    <div className="menu-stats-section">
                        <div className="menu-stats-label">Resources</div>
                        <div className="menu-stats-grid three-col">
                            <div className="menu-stat">
                                <img src={GoldIcon} alt="Gold" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Gold</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.gold}</span>
                                </div>
                            </div>
                            <div className="menu-stat">
                                <img src={ServantsIcon} alt="Servants" className="menu-stat-icon" />
                                <div className="menu-stat-info">
                                    <span className="menu-stat-name">Servants</span>
                                    <span className="menu-stat-value">{stage().currentState.stats.servants}/{stage().currentState.stats.maxServants}</span>
                                </div>
                            </div>
                            <div className="menu-stat day-stat">
                                <div className="day-badge">Day {stage().currentState.stats.day}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Management */}
                <div className="game-actions">
                    <button className="game-action-btn new-game" onClick={() => setShowNewGameConfirm(true)}>
                        🆕 New Game
                    </button>
                    <button className="game-action-btn save-game" onClick={() => openSaveMenu('save')} disabled={!hasSaveData}>
                        💾 Save
                    </button>
                    <button className="game-action-btn load-game" onClick={() => openSaveMenu('load')}>
                        📂 Load
                    </button>
                </div>

                {saveMessage && <div className="menu-save-message">{saveMessage}</div>}
                
                {/* Navigation */}
                <div className="menu-options">
                    {menuOptions.map((option) => (
                        <button
                            key={option.screen}
                            className="menu-button"
                            onClick={() => setScreenType(option.screen)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* New Game Confirmation */}
            {showNewGameConfirm && (
                <div className="confirmation-overlay" onClick={() => setShowNewGameConfirm(false)}>
                    <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>🆕 New Game</h3>
                        <p>Start a new game? Your current unsaved progress will be lost.</p>
                        <p className="warning-text">Make sure to save first if you want to keep your progress.</p>
                        <div className="confirmation-actions">
                            <button className="confirm-button cancel" onClick={() => setShowNewGameConfirm(false)}>
                                Cancel
                            </button>
                            <button className="confirm-button confirm" onClick={handleNewGame}>
                                Start New Game
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save/Load Menu */}
            {showSaveMenu && (
                <div className="confirmation-overlay" onClick={() => setShowSaveMenu(false)}>
                    <div className="save-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="save-menu-header">
                            <h3>{saveMenuMode === 'save' ? '💾 Save Game' : '📂 Load Game'}</h3>
                            <button className="close-btn" onClick={() => setShowSaveMenu(false)}>✕</button>
                        </div>
                        
                        <div className="save-menu-tabs">
                            <button 
                                className={`tab-btn ${saveMenuMode === 'save' ? 'active' : ''}`}
                                onClick={() => setSaveMenuMode('save')}
                            >
                                💾 Save
                            </button>
                            <button 
                                className={`tab-btn ${saveMenuMode === 'load' ? 'active' : ''}`}
                                onClick={() => setSaveMenuMode('load')}
                            >
                                📂 Load
                            </button>
                        </div>

                        <div className="save-slots">
                            {saveSlots.map((saveFile, index) => (
                                <div key={index} className={`save-slot ${saveFile ? 'occupied' : 'empty'}`}>
                                    <div className="slot-header">
                                        <span className="slot-number">Slot {index + 1}</span>
                                        {saveFile ? (
                                            <span className="slot-date">
                                                {new Date(saveFile.timestamp).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="slot-empty-label">— Empty —</span>
                                        )}
                                    </div>
                                    
                                    {saveFile && (
                                        <div className="slot-info">
                                            <span className="slot-name">{saveFile.name}</span>
                                            <span className="slot-rooms">
                                                {saveFile.data.filter(s => s.roomType !== null).length} / {saveFile.data.length} rooms built
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="slot-actions">
                                        {saveMenuMode === 'save' ? (
                                            <button 
                                                className="slot-btn save"
                                                onClick={() => handleSaveToSlot(index)}
                                                disabled={!hasSaveData}
                                            >
                                                {saveFile ? 'Overwrite' : 'Save Here'}
                                            </button>
                                        ) : (
                                            <button 
                                                className="slot-btn load"
                                                onClick={() => handleLoadFromSlot(index)}
                                                disabled={!saveFile}
                                            >
                                                Load
                                            </button>
                                        )}
                                        {saveFile && (
                                            <button 
                                                className="slot-btn delete"
                                                onClick={() => handleDeleteSlot(index)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
