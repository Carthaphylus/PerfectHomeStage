import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Hero } from '../Stage';

interface HeroesScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const HeroesScreen: FC<HeroesScreenProps> = ({ stage, setScreenType }) => {
    const heroes = Object.values(stage().currentState.heroes);
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    return (
        <div className="heroes-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Heroes</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="heroes-content">
                {/* Hero Cards Grid */}
                <div className="heroes-grid">
                    {heroes.length === 0 ? (
                        <div className="empty-message">No heroes encountered yet...</div>
                    ) : (
                        heroes.map((hero) => (
                            <div 
                                key={hero.name} 
                                className={`hero-card status-${hero.status} ${selectedHero?.name === hero.name ? 'selected' : ''}`}
                                onClick={() => setSelectedHero(selectedHero?.name === hero.name ? null : hero)}
                            >
                                <div className="hero-card-avatar">
                                    <img src={hero.avatar} alt={hero.name} />
                                </div>
                                <div className="hero-card-info">
                                    <span className="hero-card-name">{hero.name}</span>
                                    <span className="hero-card-class">{hero.heroClass}</span>
                                    <span className={`hero-card-status status-${hero.status}`}>{hero.status}</span>
                                </div>
                                {hero.status === 'converting' && (
                                    <div className="hero-conversion-bar">
                                        <div
                                            className="hero-conversion-fill"
                                            style={{ width: `${hero.conversionProgress}%` }}
                                        />
                                        <span className="hero-conversion-text">{hero.conversionProgress}%</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Detail Panel */}
                {selectedHero && (
                    <div className="hero-detail-panel">
                        <div className="hero-detail-avatar">
                            <img src={selectedHero.avatar} alt={selectedHero.name} />
                        </div>
                        <h3>{selectedHero.name}</h3>
                        <span className="hero-detail-class">{selectedHero.heroClass}</span>
                        <span className={`hero-detail-status status-${selectedHero.status}`}>{selectedHero.status}</span>

                        {selectedHero.location && (
                            <div className="hero-detail-row">
                                <span className="hero-detail-label">Location</span>
                                <span className="hero-detail-value">{selectedHero.location}</span>
                            </div>
                        )}

                        {selectedHero.status === 'converting' && (
                            <div className="hero-detail-row">
                                <span className="hero-detail-label">Conversion</span>
                                <div className="hero-conversion-bar">
                                    <div
                                        className="hero-conversion-fill"
                                        style={{ width: `${selectedHero.conversionProgress}%` }}
                                    />
                                    <span className="hero-conversion-text">{selectedHero.conversionProgress}%</span>
                                </div>
                            </div>
                        )}

                        {selectedHero.traits && selectedHero.traits.length > 0 && (
                            <div className="hero-detail-traits">
                                <span className="hero-detail-label">Traits</span>
                                <div className="trait-list">
                                    {selectedHero.traits.map(t => (
                                        <span key={t} className="trait-badge">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
