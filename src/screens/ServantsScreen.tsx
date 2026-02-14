import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant } from '../Stage';

interface ServantsScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);

    return (
        <div className="servants-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Servants</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="servants-content">
                {/* Servant Cards Grid */}
                <div className="servants-grid">
                    {servants.length === 0 ? (
                        <div className="empty-message">No servants yet...</div>
                    ) : (
                        servants.map((servant) => (
                            <div 
                                key={servant.name} 
                                className={`servant-card ${selectedServant?.name === servant.name ? 'selected' : ''}`}
                                onClick={() => setSelectedServant(selectedServant?.name === servant.name ? null : servant)}
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

                {/* Detail Panel */}
                {selectedServant && (
                    <div className="servant-detail-panel">
                        <div className="servant-detail-avatar">
                            <img src={selectedServant.avatar} alt={selectedServant.name} />
                        </div>
                        <h3>{selectedServant.name}</h3>
                        <span className="servant-detail-class">{selectedServant.formerClass}</span>

                        <div className="servant-detail-row">
                            <span className="servant-detail-label">Loyalty</span>
                            <div className="servant-loyalty-bar large">
                                <div
                                    className="servant-loyalty-fill"
                                    style={{ width: `${selectedServant.loyalty}%` }}
                                />
                                <span className="servant-loyalty-text">{selectedServant.loyalty}%</span>
                            </div>
                        </div>

                        {selectedServant.assignedTask && (
                            <div className="servant-detail-row">
                                <span className="servant-detail-label">Task</span>
                                <span className="servant-detail-value">{selectedServant.assignedTask}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
