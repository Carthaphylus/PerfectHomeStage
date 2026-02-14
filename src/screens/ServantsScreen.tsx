import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant } from '../Stage';
import { CharacterGallery } from './CharacterGallery';

interface ServantsScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);
    const [showGallery, setShowGallery] = useState(false);

    // Full profile view when a servant is selected
    if (selectedServant) {
        const s = selectedServant;

        if (showGallery) {
            return (
                <CharacterGallery
                    stage={stage}
                    characterName={s.name}
                    avatarUrl={s.avatar}
                    color={s.color}
                    onClose={() => setShowGallery(false)}
                />
            );
        }

        return (
            <div className="char-profile-screen" style={{ '--char-color': s.color } as React.CSSProperties}>
                <div className="screen-header">
                    <button className="back-button" onClick={() => setSelectedServant(null)}>
                        &lt; Back
                    </button>
                    <h2>{s.name}</h2>
                    <button className="gallery-button" onClick={() => setShowGallery(true)}>
                        🖼️ Gallery
                    </button>
                </div>
                <div className="char-profile-content">
                    <div className="char-card">
                        <div className="char-avatar-frame">
                            <img src={s.avatar} alt={s.name} />
                        </div>
                        <div className="char-info">
                            <h3 className="char-name">{s.name}</h3>
                            <span className="char-title">{s.formerClass}</span>
                        </div>
                    </div>
                    <div className="char-bio-panel">
                        <div className="char-bio-section">
                            <h4>About</h4>
                            <p>{s.description}</p>
                        </div>

                        <div className="char-bio-section">
                            <h4>Service</h4>
                            <div className="char-detail-row">
                                <span className="char-detail-label">Loyalty</span>
                                <span className="char-detail-value">{s.loyalty}%</span>
                            </div>
                            {s.assignedTask && (
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Task</span>
                                    <span className="char-detail-value">{s.assignedTask}</span>
                                </div>
                            )}
                            <div className="char-loyalty-bar">
                                <div className="char-loyalty-fill" style={{ width: `${s.loyalty}%` }} />
                            </div>
                        </div>

                        <div className="char-bio-section">
                            <h4>Details</h4>
                            {Object.entries(s.details).map(([key, value]) => (
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
                                {s.traits.map(t => (
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
        <div className="servants-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Servants</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="servants-content">
                <div className="servants-grid">
                    {servants.length === 0 ? (
                        <div className="empty-message">No servants yet...</div>
                    ) : (
                        servants.map((servant) => (
                            <div 
                                key={servant.name} 
                                className="servant-card"
                                style={{ '--char-color': servant.color } as React.CSSProperties}
                                onClick={() => setSelectedServant(servant)}
                            >
                                <div className="servant-card-avatar">
                                    <img src={servant.avatar} alt={servant.name} />
                                </div>
                                <div className="servant-card-info">
                                    <span className="servant-card-name">{servant.name}</span>
                                    <span className="servant-card-class">{servant.formerClass}</span>
                                </div>
                                <div className="servant-loyalty-bar">
                                    <div
                                        className="servant-loyalty-fill"
                                        style={{ width: `${servant.loyalty}%` }}
                                    />
                                    <span className="servant-loyalty-text">{servant.loyalty}%</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
