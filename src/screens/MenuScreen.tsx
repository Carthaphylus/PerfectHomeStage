import React, { FC } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

interface MenuScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const MenuScreen: FC<MenuScreenProps> = ({ stage, setScreenType }) => {
    const menuOptions = [
        { label: '🏰 Manor', screen: ScreenType.MANOR },
        { label: '🗺️ World Map', screen: ScreenType.WORLD_MAP },
        { label: '🎯 Heroes', screen: ScreenType.HEROES },
        { label: '👥 Servants', screen: ScreenType.SERVANTS },
    ];

    return (
        <div className="menu-screen">
            <div className="menu-content">
                <h1 className="menu-title">Perfect Home</h1>
                <div className="menu-subtitle">The Witch's Domain</div>
                
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
        </div>
    );
};
