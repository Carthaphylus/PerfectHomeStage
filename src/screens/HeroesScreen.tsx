import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Hero } from '../Stage';
import { CharacterGallery } from './CharacterGallery';

interface HeroesScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const HeroesScreen: FC<HeroesScreenProps> = ({ stage, setScreenType }) => {
    const heroes = Object.values(stage().currentState.heroes);
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
    const [showGallery, setShowGallery] = useState(false);

    // Full profile view when a hero is selected
    if (selectedHero) {
        const h = selectedHero;

        if (showGallery) {
            return (
                <CharacterGallery
                    stage={stage}
                    charName={h.name}
                    charAvatar={h.avatar}
                    charSpecies={h.details['Species'] || 'character'}
                    charColor={h.color}
                    onClose={() => setShowGallery(false)}
                />
            );
        }

        return (
            <div className="char-profile-screen" style={{ '--char-color': h.color } as React.CSSProperties}>
                <div className="screen-header">
                    <button className="back-button" onClick={() => setSelectedHero(null)}>
                        &lt; Back
                    </button>
                    <h2>{h.name}</h2>
                    <div className="header-spacer"></div>
                </div>
                <div className="char-profile-content">
                    <div className="char-card">
                        <div className="char-avatar-frame">
                            <img src={h.avatar} alt={h.name} />
                        </div>
                        <div className="char-info">
                            <h3 className="char-name">{h.name}</h3>
                            <span className="char-title">{h.heroClass}</span>
                            <span className={`char-status-badge status-${h.status}`}>{h.status}</span>
                            <button className="gallery-open-btn" onClick={() => setShowGallery(true)}>
                                🖼️ Gallery
                            </button>
                        </div>
                    </div>
                    <div className="char-bio-panel">
                        <div className="char-bio-section">
                            <h4>About</h4>
                            <p>{h.description}</p>
                        </div>

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

                        <div className="char-bio-section">
                            <h4>Details</h4>
                            {Object.entries(h.details).map(([key, value]) => (
                                <div key={key} className="char-detail-row">
                                    <span className="char-detail-label">{key}</span>
                                    {key === 'Gender' ? (
                                        <span className="char-detail-value char-gender-value">
                                            <span className="gender-symbol">{value.split(' ')[0]}</span>
                                            <span>{value.split(' ').slice(1).join(' ')}</span>
                                        </span>
                                    ) : (
                                        <span className="char-detail-value">{value}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="char-bio-section">
                            <h4>Traits</h4>
                            <div className="char-trait-list">
                                {h.traits.map(t => (
                                    <span key={t} className="char-trait">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
