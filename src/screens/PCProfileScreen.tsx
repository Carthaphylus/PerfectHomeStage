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

                <div className="pc-bio-panel">
                    <div className="pc-bio-section">
                        <h4>About</h4>
                        <p>{pc.description}</p>
                    </div>

                    <div className="pc-bio-section">
                        <h4>Details</h4>
                        {Object.entries(pc.details).map(([key, value]) => (
                            <div key={key} className="pc-detail-row">
                                <span className="pc-detail-label">{key}</span>
                                <span className="pc-detail-value">{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pc-bio-section">
                        <h4>Traits</h4>
                        <div className="pc-trait-list">
                            {pc.traits.map(t => (
                                <span key={t} className="pc-trait">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
