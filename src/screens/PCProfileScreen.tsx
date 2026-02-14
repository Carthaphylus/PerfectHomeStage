import React, { FC } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const PCProfileScreen: FC<PCProfileScreenProps> = ({ stage, setScreenType }) => {
    const pc = stage().currentState.playerCharacter;
    const stats = stage().currentState.stats;

    return (
        <div className="pc-profile-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Profile</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="pc-profile-content">
                <div className="pc-card">
                    <div className="pc-avatar-frame">
                        <img src={pc.avatar} alt={pc.name} className="pc-avatar" />
                    </div>
                    <div className="pc-info">
                        <h3 className="pc-name">{pc.name}</h3>
                        <span className="pc-title">{pc.title}</span>
                    </div>
                </div>

                <div className="pc-stats-panel">
                    <h4>Skills</h4>
                    <div className="pc-stats-grid">
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Power</span>
                            <span className="pc-stat-value">{stats.skills.power}</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Wisdom</span>
                            <span className="pc-stat-value">{stats.skills.wisdom}</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Charm</span>
                            <span className="pc-stat-value">{stats.skills.charm}</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Speed</span>
                            <span className="pc-stat-value">{stats.skills.speed}</span>
                        </div>
                    </div>

                    <h4>Household</h4>
                    <div className="pc-stats-grid">
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Comfort</span>
                            <span className="pc-stat-value">{stats.household.comfort}/10</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Obedience</span>
                            <span className="pc-stat-value">{stats.household.obedience}/10</span>
                        </div>
                    </div>

                    <h4>Resources</h4>
                    <div className="pc-stats-grid">
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Gold</span>
                            <span className="pc-stat-value">{stats.gold}</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Servants</span>
                            <span className="pc-stat-value">{stats.servants}/{stats.maxServants}</span>
                        </div>
                        <div className="pc-stat-item">
                            <span className="pc-stat-label">Day</span>
                            <span className="pc-stat-value">{stats.day}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
