import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import type { SaveFileSlot } from '../Stage';

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

                <div className="stats-summary">
                    <div>❤️ {stage().currentState.stats.health}/{stage().currentState.stats.maxHealth}</div>
                    <div>✨ {stage().currentState.stats.mana}/{stage().currentState.stats.maxMana}</div>
                    <div>💰 {stage().currentState.stats.money}</div>
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
