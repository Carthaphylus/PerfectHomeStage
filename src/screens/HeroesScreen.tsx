import React, { FC } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Hero } from '../Stage';

interface HeroesScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const HeroesScreen: FC<HeroesScreenProps> = ({ stage, setScreenType }) => {
    const heroes = Object.values(stage().currentState.heroes);
    const servants = Object.values(stage().currentState.servants);

    return (
        <div className="heroes-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    ← Menu
                </button>
                <h2>Heroes & Servants</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="heroes-content">
                {/* Heroes Section */}
                <div className="heroes-section">
                    <h3>🎯 Heroes ({heroes.length})</h3>
                    <div className="hero-list">
                        {heroes.length === 0 ? (
                            <div className="empty-message">No heroes encountered yet...</div>
                        ) : (
                            heroes.map((hero) => (
                                <div key={hero.name} className={`hero-item status-${hero.status}`}>
                                    <div className="hero-header">
                                        <span className="hero-name">{hero.name}</span>
                                        <span className="hero-status">{hero.status}</span>
                                    </div>
                                    {hero.status === 'converting' && (
                                        <div className="conversion-bar">
                                            <div
                                                className="conversion-fill"
                                                style={{ width: `${hero.conversionProgress}%` }}
                                            />
                                            <span className="conversion-text">{hero.conversionProgress}%</span>
                                        </div>
                                    )}
                                    {hero.location && (
                                        <div className="hero-location">📍 {hero.location}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Servants Section */}
                <div className="servants-section">
                    <h3>👥 Servants ({servants.length})</h3>
                    <div className="servant-list">
                        {servants.length === 0 ? (
                            <div className="empty-message">No servants yet...</div>
                        ) : (
                            servants.map((servant) => (
                                <div key={servant.name} className="servant-item">
                                    <div className="servant-header">
                                        <span className="servant-name">✨ {servant.name}</span>
                                        <span className="servant-class">{servant.formerClass}</span>
                                    </div>
                                    <div className="loyalty-bar">
                                        <div
                                            className="loyalty-fill"
                                            style={{ width: `${servant.loyalty}%` }}
                                        />
                                        <span className="loyalty-text">Loyalty: {servant.loyalty}%</span>
                                    </div>
                                    {servant.assignedTask && (
                                        <div className="servant-task">📋 {servant.assignedTask}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
