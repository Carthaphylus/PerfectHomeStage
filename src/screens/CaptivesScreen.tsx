import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Hero } from '../Stage';
import { CharacterProfile } from './CharacterProfile';

interface CaptivesScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    startEvent: (definitionId: string, target?: string, returnTo?: ScreenType) => void;
}

export const CaptivesScreen: FC<CaptivesScreenProps> = ({ stage, setScreenType, startEvent }) => {
    const [, forceUpdate] = useState(0);
    const allHeroes = Object.values(stage().currentState.heroes);
    const captives = allHeroes.filter(h => h.status === 'captured' || h.status === 'converting');
    const [selectedCaptive, setSelectedCaptive] = useState<Hero | null>(null);

    const debugFree = (heroName: string) => {
        const hero = stage().currentState.heroes[heroName];
        if (hero) {
            hero.status = 'free';
            hero.brainwashing = 0;
            setSelectedCaptive(null);
            forceUpdate(n => n + 1);
        }
    };

    const debugBrainwash = (heroName: string, delta: number) => {
        const hero = stage().currentState.heroes[heroName];
        if (hero) {
            hero.brainwashing = Math.max(0, Math.min(100, hero.brainwashing + delta));
            if (hero.brainwashing > 0 && hero.status === 'captured') {
                hero.status = 'converting';
            }
            setSelectedCaptive({ ...hero });
            forceUpdate(n => n + 1);
        }
    };

    const debugConvert = (heroName: string) => {
        const hero = stage().currentState.heroes[heroName];
        if (hero) {
            const charData = (stage() as any).constructor === undefined ? undefined : undefined;
            stage().currentState.servants[heroName] = {
                name: heroName,
                formerClass: hero.heroClass,
                avatar: hero.avatar,
                color: hero.color,
                description: hero.description,
                traits: hero.traits,
                details: hero.details,
                stats: hero.stats,
                love: 50,
                obedience: 100,
            };
            delete stage().currentState.heroes[heroName];
            setSelectedCaptive(null);
            forceUpdate(n => n + 1);
        }
    };

    // Full profile view when a captive is selected
    if (selectedCaptive) {
        const h = selectedCaptive;
        const brainwashingComplete = h.brainwashing >= 100;

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
                onBack={() => setSelectedCaptive(null)}
                statusBadge={
                    <span className={`char-status-badge status-${h.status}`}>{h.status}</span>
                }
                extraSections={
                    <div className="char-bio-section">
                        <h4>Brainwashing</h4>
                        <div className="brainwashing-bar-wrapper">
                            <div className="brainwashing-bar">
                                <div
                                    className="brainwashing-fill"
                                    style={{ width: `${h.brainwashing}%` }}
                                />
                                <span className="brainwashing-text">{h.brainwashing}%</span>
                            </div>
                            <div className="brainwashing-label">
                                {brainwashingComplete
                                    ? '🌀 Fully Conditioned'
                                    : h.status === 'converting'
                                        ? '🌀 Conditioning in progress...'
                                        : '🔒 Awaiting conditioning'
                                }
                            </div>
                        </div>
                        {brainwashingComplete && (
                            <button className="captive-convert-btn" disabled>
                                ✨ Begin Conversion Scene
                            </button>
                        )}
                        {!brainwashingComplete && (
                            <button
                                className="captive-convert-btn conditioning-btn"
                                onClick={() => startEvent('brainwashing_session', h.name, ScreenType.CAPTIVES)}
                            >
                                🌀 Begin Conditioning Session
                            </button>
                        )}
                        {h.location && (
                            <>
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Location</span>
                                    <span className="char-detail-value">{h.location}</span>
                                </div>
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Status</span>
                                    <span className="char-detail-value" style={{ textTransform: 'capitalize' }}>{h.status}</span>
                                </div>
                            </>
                        )}
                        <div className="debug-section">
                            <h4>🛠 Debug</h4>
                            <div className="debug-btn-row">
                                <button className="debug-btn debug-free" onClick={() => debugFree(h.name)}>🔓 Free</button>
                                <button className="debug-btn debug-brainwash" onClick={() => debugBrainwash(h.name, 10)}>🌀 +10</button>
                                <button className="debug-btn debug-brainwash" onClick={() => debugBrainwash(h.name, -10)}>🌀 -10</button>
                                {brainwashingComplete && (
                                    <button className="debug-btn debug-convert" onClick={() => debugConvert(h.name)}>✨ Convert</button>
                                )}
                            </div>
                        </div>
                    </div>
                }
            />
        );
    }

    // Card grid view
    return (
        <div className="captives-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Captives</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="captives-content">
                <div className="captives-grid">
                    {captives.length === 0 ? (
                        <div className="empty-message">No captives yet...</div>
                    ) : (
                        captives.map((hero) => (
                            <div
                                key={hero.name}
                                className={`captive-card status-${hero.status}`}
                                style={{ '--char-color': hero.color } as React.CSSProperties}
                                onClick={() => setSelectedCaptive(hero)}
                            >
                                <div className="captive-card-avatar">
                                    <img src={hero.avatar} alt={hero.name} />
                                </div>
                                <div className="captive-card-info">
                                    <span className="captive-card-name">{hero.name}</span>
                                    <span className="captive-card-class">{hero.heroClass}</span>
                                    <span className={`captive-card-status status-${hero.status}`}>{hero.status}</span>
                                </div>
                                <button
                                    className="debug-btn debug-free-small"
                                    onClick={(e) => { e.stopPropagation(); debugFree(hero.name); }}
                                    title="Debug: Free captive"
                                >
                                    🔓
                                </button>
                                <div className="captive-brainwashing-bar">
                                    <div
                                        className="captive-brainwashing-fill"
                                        style={{ width: `${hero.brainwashing}%` }}
                                    />
                                    <span className="captive-brainwashing-text">{hero.brainwashing}%</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
