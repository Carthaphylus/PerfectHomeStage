import React, { FC, useState } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import type { SaveFileSlot } from '../data';
import { GameIcon } from './GameIcon';

// Stat icons for save slots
import GoldIcon from '../assets/Images/Resources/GoldIcon.png';
import ServantsIcon from '../assets/Images/Resources/Servants.png';

interface StartMenuScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const StartMenuScreen: FC<StartMenuScreenProps> = ({ stage, setScreenType }) => {
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [saveMenuMode, setSaveMenuMode] = useState<'save' | 'load'>('save');
    const [saveSlots, setSaveSlots] = useState<(SaveFileSlot | null)[]>([]);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

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
        const ok = stage().saveToSlot(slotIndex);
        if (ok) {
            setSaveSlots(stage().getSaveSlots());
            flashMessage(`Saved to Slot ${slotIndex + 1}!`);
        } else {
            flashMessage('Save failed');
        }
    };

    const handleLoadFromSlot = (slotIndex: number) => {
        const saveFile = stage().loadFromSlot(slotIndex);
        if (!saveFile) {
            flashMessage('Empty slot');
            return;
        }
        stage().restoreFromSave(saveFile);
        setShowSaveMenu(false);
        flashMessage(`Loaded!`);
        setScreenType(ScreenType.MENU);
    };

    const handleDeleteSlot = (slotIndex: number) => {
        stage().deleteSlot(slotIndex);
        setSaveSlots(stage().getSaveSlots());
        flashMessage(`Slot ${slotIndex + 1} deleted`);
    };

    const handleNewGame = () => {
        stage().resetManor();
        setShowNewGameConfirm(false);
        setScreenType(ScreenType.MENU);
    };

    const handleContinue = () => {
        setScreenType(ScreenType.MENU);
    };

    const currentDay = stage().currentState.stats.day;
    // Show continue if day > 1 (user has played at least one turn)
    const hasProgress = currentDay > 1 || Object.keys(stage().currentState.servants).length > 0;

    /** Render a compact save slot summary */
    const renderSlotPreview = (save: SaveFileSlot) => {
        const heroCount = save.heroes ? Object.keys(save.heroes).length : 0;
        const servantCount = save.servants ? Object.keys(save.servants).length : 0;
        const itemCount = save.inventory ? Object.keys(save.inventory).length : 0;
        const roomCount = save.manorSlots ? save.manorSlots.filter(s => s.roomType !== null).length : 0;
        const totalRooms = save.manorSlots ? save.manorSlots.length : 0;

        return (
            <>
                <div className="slot-info">
                    <span className="slot-name">{save.name}</span>
                </div>
                <div className="slot-stats">
                    <div className="slot-stats-row">
                        <span className="slot-stat">
                            <img src={GoldIcon} alt="" className="slot-stat-icon" />
                            {save.stats.gold}
                        </span>
                        <span className="slot-stat">
                            <img src={ServantsIcon} alt="" className="slot-stat-icon" />
                            {save.stats.servants}/{save.stats.maxServants}
                        </span>
                        <span className="slot-stat">
                            <GameIcon icon="sparkles" size={10} className="icon-mana" />
                            {save.stats.mana}
                        </span>
                    </div>
                    <div className="slot-stats-row">
                        <span className="slot-stat">
                            <GameIcon icon="castle" size={10} className="slot-stat-mini-icon" />
                            {roomCount}/{totalRooms} rooms
                        </span>
                        <span className="slot-stat">
                            <GameIcon icon="target" size={10} className="slot-stat-mini-icon" />
                            {heroCount} heroes
                        </span>
                        <span className="slot-stat">
                            <GameIcon icon="users" size={10} className="slot-stat-mini-icon" />
                            {servantCount} servants
                        </span>
                    </div>
                    <div className="slot-stats-row">
                        <span className="slot-stat">
                            <GameIcon icon="backpack" size={10} className="slot-stat-mini-icon" />
                            {itemCount} items
                        </span>
                        <span className="slot-day">Day {save.stats.day}</span>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="start-menu">
            {/* Ambient particles */}
            <div className="sm-particles">
                {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className={`sm-particle sm-particle-${i % 4}`} style={{
                        left: `${10 + (i * 7) % 80}%`,
                        animationDelay: `${i * 0.7}s`,
                        animationDuration: `${6 + (i % 3) * 2}s`,
                    }} />
                ))}
            </div>

            {/* Decorative frame */}
            <div className="sm-frame">
                <div className="sm-frame-corner sm-corner-tl" />
                <div className="sm-frame-corner sm-corner-tr" />
                <div className="sm-frame-corner sm-corner-bl" />
                <div className="sm-frame-corner sm-corner-br" />
            </div>

            {/* Emblem */}
            <div className="sm-emblem">
                <div className="sm-emblem-ring" />
                <div className="sm-emblem-inner">
                    <GameIcon icon="sparkles" size={28} className="sm-emblem-icon" />
                </div>
                <div className="sm-emblem-ring sm-ring-outer" />
            </div>

            {/* Title */}
            <h1 className="sm-title">Perfect Home</h1>
            <div className="sm-subtitle">The Witch's Domain</div>

            {/* Ornamental divider */}
            <div className="sm-divider">
                <span className="sm-divider-line" />
                <GameIcon icon="diamond" size={8} className="sm-divider-gem" />
                <span className="sm-divider-line" />
            </div>

            {saveMessage && <div className="sm-flash-message">{saveMessage}</div>}

            {/* Main buttons */}
            <div className="sm-actions">
                {hasProgress && (
                    <button className="sm-btn sm-btn-continue" onClick={handleContinue}>
                        <GameIcon icon="play" size={14} className="sm-btn-icon" />
                        <span className="sm-btn-label">Continue</span>
                        <span className="sm-btn-detail">Day {currentDay}</span>
                    </button>
                )}

                <button className="sm-btn sm-btn-new" onClick={() => setShowNewGameConfirm(true)}>
                    <GameIcon icon="plus-circle" size={14} className="sm-btn-icon" />
                    <span className="sm-btn-label">New Game</span>
                </button>

                <div className="sm-save-row">
                    <button className="sm-btn sm-btn-save" onClick={() => openSaveMenu('save')}>
                        <GameIcon icon="save" size={14} className="sm-btn-icon" />
                        <span className="sm-btn-label">Save</span>
                    </button>
                    <button className="sm-btn sm-btn-load" onClick={() => openSaveMenu('load')}>
                        <GameIcon icon="folder-open" size={14} className="sm-btn-icon" />
                        <span className="sm-btn-label">Load</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="sm-footer">
                <GameIcon icon="moon" size={8} className="sm-footer-icon" />
                <span>A witch always has time</span>
            </div>

            {/* New Game Confirmation */}
            {showNewGameConfirm && (
                <div className="confirmation-overlay" onClick={() => setShowNewGameConfirm(false)}>
                    <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3><GameIcon icon="plus-circle" size={14} className="icon-green" /> New Game</h3>
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
                            <h3>{saveMenuMode === 'save' ? <><GameIcon icon="save" size={14} className="icon-blue" /> Save Game</> : <><GameIcon icon="folder-open" size={14} className="icon-gold" /> Load Game</>}</h3>
                            <button className="close-btn" onClick={() => setShowSaveMenu(false)}><GameIcon icon="x" size={12} /></button>
                        </div>
                        
                        <div className="save-menu-tabs">
                            <button 
                                className={`tab-btn ${saveMenuMode === 'save' ? 'active' : ''}`}
                                onClick={() => setSaveMenuMode('save')}
                            >
                                <GameIcon icon="save" size={10} /> Save
                            </button>
                            <button 
                                className={`tab-btn ${saveMenuMode === 'load' ? 'active' : ''}`}
                                onClick={() => setSaveMenuMode('load')}
                            >
                                <GameIcon icon="folder-open" size={10} /> Load
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
                                    
                                    {saveFile && renderSlotPreview(saveFile)}
                                    
                                    <div className="slot-actions">
                                        {saveMenuMode === 'save' ? (
                                            <button 
                                                className="slot-btn save"
                                                onClick={() => handleSaveToSlot(index)}
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
                                                <GameIcon icon="trash-2" size={12} className="icon-red" />
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
