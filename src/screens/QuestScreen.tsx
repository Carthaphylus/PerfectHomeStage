import React, { FC } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import type { QuestDefinition } from '../data';
import { GameIcon } from './GameIcon';

interface QuestScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const QuestScreen: FC<QuestScreenProps> = ({ stage, setScreenType }) => {
    const s = stage();
    const st = s.currentState;

    const activeQuests = s.getActiveQuests();
    const availableQuests = s.getAvailableQuests();
    const completedQuestIds = st.completedQuests;

    const completedQuests = completedQuestIds
        .map(id => s.getQuestDefinition(id))
        .filter((q): q is QuestDefinition => q !== null);

    return (
        <div className="quests-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    <GameIcon icon="chevron-left" size={10} /> Menu
                </button>
                <h2>Quests</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="quests-content">
                {/* Active Quests */}
                {activeQuests.length > 0 && (
                    <div className="quest-section">
                        <h3 className="quest-section-title">
                            <GameIcon icon="scroll" size={14} />
                            Active Quests
                        </h3>
                        <div className="quest-list">
                            {activeQuests.map(aq => {
                                const def = s.getQuestDefinition(aq.questId);
                                if (!def) return null;
                                const hero = def.heroName ? st.heroes[def.heroName] : null;
                                const currentStep = def.steps[aq.currentStep];
                                return (
                                    <div key={aq.questId} className="quest-card quest-active">
                                        <div className="quest-card-header">
                                            {hero?.avatar && (
                                                <div className="quest-hero-avatar">
                                                    <img src={hero.avatar} alt={def.heroName} />
                                                </div>
                                            )}
                                            <div className="quest-card-title">
                                                <span className="quest-name">{def.name}</span>
                                                <span className="quest-desc">{def.description}</span>
                                            </div>
                                            <GameIcon icon={def.icon} size={20} className="quest-icon" />
                                        </div>

                                        <div className="quest-steps">
                                            {def.steps.map((step, i) => {
                                                const isCompleted = aq.completedSteps.includes(i);
                                                const isCurrent = i === aq.currentStep;
                                                const isLocked = i > aq.currentStep;
                                                const isLast = i === def.steps.length - 1;
                                                return (
                                                    <div
                                                        key={step.id}
                                                        className={`quest-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                                                    >
                                                        {/* Vertical track */}
                                                        <div className="quest-step-track">
                                                            <div className="quest-step-marker">
                                                                {isCompleted ? (
                                                                    <GameIcon icon="check" size={9} />
                                                                ) : isCurrent ? (
                                                                    <GameIcon icon={step.icon} size={9} />
                                                                ) : (
                                                                    <span className="quest-step-num">{i + 1}</span>
                                                                )}
                                                            </div>
                                                            {!isLast && <div className="quest-step-line" />}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="quest-step-info">
                                                            <div className="quest-step-name-row">
                                                                <span className="quest-step-name">{step.name}</span>
                                                                {isCurrent && <span className="quest-step-now-badge">▶ NOW</span>}
                                                            </div>
                                                            {isCurrent && (
                                                                <>
                                                                    <span className="quest-step-desc">{step.description}</span>
                                                                    <span className="quest-step-location">
                                                                        <GameIcon icon="map-pin" size={7} /> {step.location}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="quest-progress-bar">
                                            <div
                                                className="quest-progress-fill"
                                                style={{ width: `${(aq.completedSteps.length / def.steps.length) * 100}%` }}
                                            />
                                            <span className="quest-progress-text">
                                                {aq.completedSteps.length}/{def.steps.length}
                                            </span>
                                        </div>

                                        {currentStep && (
                                            <div className="quest-next-hint">
                                                <GameIcon icon="compass" size={10} />
                                                <span>Head to <strong>{currentStep.location}</strong> to continue</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Leads — quests available but not yet started */}
                {availableQuests.length > 0 && (
                    <div className="quest-section">
                        <h3 className="quest-section-title quest-leads-title">
                            <GameIcon icon="compass" size={14} />
                            Leads
                        </h3>
                        <div className="quest-list">
                            {availableQuests.map(def => {
                                const hero = def.heroName ? st.heroes[def.heroName] : null;
                                return (
                                    <div key={def.id} className="quest-card quest-available">
                                        <div className="quest-card-header">
                                            {hero?.avatar && (
                                                <div className="quest-hero-avatar">
                                                    <img src={hero.avatar} alt={def.heroName} />
                                                </div>
                                            )}
                                            <div className="quest-card-title">
                                                <span className="quest-name">{def.name}</span>
                                                <span className="quest-desc">{def.description}</span>
                                            </div>
                                            <GameIcon icon={def.icon} size={20} className="quest-icon" />
                                        </div>
                                        <div className="quest-next-hint">
                                            <GameIcon icon="map-pin" size={10} />
                                            <span>Look for leads in <strong>{def.steps[0]?.location}</strong></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Completed Quests */}
                {completedQuests.length > 0 && (
                    <div className="quest-section">
                        <h3 className="quest-section-title quest-completed-title">
                            <GameIcon icon="trophy" size={14} />
                            Completed
                        </h3>
                        <div className="quest-list">
                            {completedQuests.map(def => (
                                <div key={def.id} className="quest-card quest-completed">
                                    <div className="quest-card-header">
                                        <div className="quest-card-title">
                                            <span className="quest-name">{def.name}</span>
                                            <span className="quest-desc">{def.description}</span>
                                        </div>
                                        <GameIcon icon="check-circle" size={20} className="quest-complete-icon" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {activeQuests.length === 0 && availableQuests.length === 0 && completedQuests.length === 0 && (
                    <div className="quest-empty">
                        <GameIcon icon="scroll" size={32} />
                        <p>No quests discovered yet.</p>
                        <p className="quest-empty-hint">Explore the world to uncover new questlines.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
