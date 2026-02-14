import React, { FC } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const PCProfileScreen: FC<PCProfileScreenProps> = ({ stage, setScreenType }) => {
    const pc = stage().currentState.playerCharacter;

    return (
        <div className="char-profile-screen" style={{ '--char-color': pc.color } as React.CSSProperties}>
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Profile</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="char-profile-content">
                <div className="char-card">
                    <div className="char-avatar-frame">
                        <img src={pc.avatar} alt={pc.name} />
                    </div>
                    <div className="char-info">
                        <h3 className="char-name">{pc.name}</h3>
                        <span className="char-title">{pc.title}</span>
                    </div>
                </div>

                <div className="char-bio-panel">
                    <div className="char-bio-section">
                        <h4>About</h4>
                        <p>{pc.description}</p>
                    </div>

                    <div className="char-bio-section">
                        <h4>Details</h4>
                        {Object.entries(pc.details).map(([key, value]) => (
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
                            {pc.traits.map(t => (
                                <span key={t} className="char-trait">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
