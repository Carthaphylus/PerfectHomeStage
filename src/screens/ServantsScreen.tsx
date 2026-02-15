import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant } from '../Stage';
import { CharacterProfile } from './CharacterProfile';

interface ServantsScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    startScene: (participants: string[], location: string) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType, startScene }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);

    const handleStartChat = (servant: Servant) => {
        const location = stage().currentState.location;
        startScene([servant.name], location);
    };

    // Full profile view when a servant is selected
    if (selectedServant) {
        const s = selectedServant;

        return (
            <CharacterProfile
                stage={stage}
                character={{
                    name: s.name,
                    avatar: s.avatar,
                    color: s.color,
                    title: s.formerClass,
                    description: s.description,
                    traits: s.traits,
                    details: s.details,
                }}
                onBack={() => setSelectedServant(null)}
                extraActions={
                    <button className="gallery-open-btn chat-btn" onClick={() => handleStartChat(s)}>
                        💬 Chat
                    </button>
                }
                extraSections={
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
                }
            />
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
                                <button
                                    className="servant-chat-btn"
                                    onClick={(e) => { e.stopPropagation(); handleStartChat(servant); }}
                                    title={`Chat with ${servant.name}`}
                                >
                                    💬
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
