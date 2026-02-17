import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Hero } from '../Stage';
import { CharacterProfile } from './CharacterProfile';

interface HeroesScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const HeroesScreen: FC<HeroesScreenProps> = ({ stage, setScreenType }) => {
    const heroes = Object.values(stage().currentState.heroes);
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

    // Full profile view when a hero is selected
    if (selectedHero) {
        const h = selectedHero;

        return (
            <CharacterProfile
                stage={stage}
                character={{
                    name: h.name,
                    avatar: h.avatar,
                    color: h.color,
                    title: h.heroClass,
                    description: h.description,
                    traits: h.traits,
                    details: h.details,
                    stats: h.stats || { prowess: 50, expertise: 50, attunement: 50, presence: 50, discipline: 50, insight: 50 },
                }}
                onBack={() => setSelectedHero(null)}
                statusBadge={
                    <span className={`char-status-badge status-${h.status}`}>{h.status}</span>
                }
                extraSections={
                    <>
                        {h.status === 'converting' && (
                            <div className="char-bio-section">
                                <h4>Conversion Progress</h4>
                                <div className="char-conversion-bar">
                                    <div className="char-conversion-fill" style={{ width: `${h.conversionProgress}%` }} />
                                    <span className="char-conversion-text">{h.conversionProgress}%</span>
                                </div>
                            </div>
                        )}
                        {h.location && (
                            <div className="char-bio-section">
                                <h4>Status</h4>
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Location</span>
                                    <span className="char-detail-value">{h.location}</span>
                                </div>
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Status</span>
                                    <span className="char-detail-value">{h.status}</span>
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        );
    }

    // Card grid view
    return (
        <div className="heroes-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Heroes</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="heroes-content">
                <div className="heroes-grid">
                    {heroes.length === 0 ? (
                        <div className="empty-message">No heroes encountered yet...</div>
                    ) : (
                        heroes.map((hero) => (
                            <div 
                                key={hero.name} 
                                className={`hero-card status-${hero.status}`}
                                style={{ '--char-color': hero.color } as React.CSSProperties}
                                onClick={() => setSelectedHero(hero)}
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
            </div>
        </div>
    );
};
