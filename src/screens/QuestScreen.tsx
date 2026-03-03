import React, { FC, useState } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import type { QuestDefinition, ActiveQuest } from '../data';
import { GameIcon } from './GameIcon';

interface QuestScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    startEvent: (eventId: string, target?: string) => void;
}

export const QuestScreen: FC<QuestScreenProps> = ({ stage, setScreenType, startEvent }) => {
    const [, forceUpdate] = useState(0);
    // Track which active quest cards are expanded; default: all expanded
    const [expandedQuests, setExpandedQuests] = useState<Set<string>>(() => new Set());
    const s = stage();
    const st = s.currentState;

    const activeQuests = s.getActiveQuests();
    const availableQuests = s.getAvailableQuests();
    const completedQuestIds = st.completedQuests;

    // Get completed quest definitions for display
    const completedQuests = completedQuestIds
        .map(id => s.getQuestDefinition(id))
        .filter((q): q is QuestDefinition => q !== null);

    const handleStartQuest = (questId: string) => {
        s.startQuest(questId);
        forceUpdate(n => n + 1);
    };

    const handleBeginStep = (quest: ActiveQuest) => {
        const def = s.getQuestDefinition(quest.questId);
        if (!def) return;
        const step = def.steps[quest.currentStep];
        if (!step) return;
        startEvent(step.eventId);
    };

    const toggleExpanded = (questId: string) => {
        setExpandedQuests(prev => {
            const next = new Set(prev);
            if (next.has(questId)) next.delete(questId);
            else next.add(questId);
            return next;
        });
    };

    // A quest card is expanded when NOT in the collapsed set (default open)
    const isExpanded = (questId: string) => !expandedQuests.has(questId);

    return (
        <div className="quests-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
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
                                const currentStep = def.steps[aq.currentStep];
                                const hero = def.heroName ? st.heroes[def.heroName] : null;
                                const expanded = isExpanded(aq.questId);
                                return (
                                    <div key={aq.questId} className={`quest-card quest-active${expanded ? ' quest-card--expanded' : ''}`}>
                                        {/* Clickable header — toggles collapse */}
                                        <div
                                            className="quest-card-header quest-card-header--toggle"
                                            onClick={() => toggleExpanded(aq.questId)}
                                            role="button"
                                            aria-expanded={expanded}
                                        >
                                            {hero?.avatar && (
                                                <div className="quest-hero-avatar">
                                                    <img src={hero.avatar} alt={def.heroName} />
                                                </div>
                                            )}
                                            <div className="quest-card-title">
                                                <span className="quest-name">{def.name}</span>
                                                <span className="quest-desc">{def.description}</span>
                                            </div>
                                            <GameIcon
                                                icon={expanded ? 'chevron-down' : 'chevron-right'}
                                                size={14}
                                                className="quest-collapse-chevron"
                                            />
                                        </div>

                                        {/* Collapsible body */}
                                        {expanded && (
                                            <>
                                                {/* Step progress */}
                                                <div className="quest-steps">
                                                    {def.steps.map((step, i) => {
                                                        const isCompleted = aq.completedSteps.includes(i);
                                                        const isCurrent = i === aq.currentStep;
                                                        const isLocked = i > aq.currentStep;
                                                        return (
                                                            <div
                                                                key={step.id}
                                                                className={`quest-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                                                            >
                                                                <div className="quest-step-marker">
                                                                    {isCompleted ? (
                                                                        <GameIcon icon="check" size={10} />
                                                                    ) : isCurrent ? (
                                                                        <GameIcon icon={step.icon} size={10} />
                                                                    ) : (
                                                                        <GameIcon icon="lock" size={10} />
                                                                    )}
                                                                </div>
                                                                <div className="quest-step-info">
                                                                    <span className="quest-step-name">{step.name}</span>
                                                                    {isCurrent && <span className="quest-step-desc">{step.description}</span>}
                                                                </div>
                                                                {isCurrent && (
                                                                    <span className="quest-step-location">
                                                                        <GameIcon icon="map-pin" size={8} /> {step.location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Progress bar */}
                                                <div className="quest-progress-bar">
                                                    <div
                                                        className="quest-progress-fill"
                                                        style={{ width: `${(aq.completedSteps.length / def.steps.length) * 100}%` }}
                                                    />
                                                    <span className="quest-progress-text">
                                                        {aq.completedSteps.length}/{def.steps.length}
                                                    </span>
                                                </div>

                                                {/* Begin step button */}
                                                {currentStep && (() => {
                                                    const isFinalStep = aq.currentStep === def.steps.length - 1;
                                                    const isOrganicOnly = def.captureQuest && !isFinalStep;
                                                    return (
                                                        <button
                                                            className={`quest-begin-btn${isOrganicOnly ? ' quest-begin-btn--locked' : ''}`}
                                                            onClick={() => !isOrganicOnly && handleBeginStep(aq)}
                                                            disabled={isOrganicOnly}
                                                            title={isOrganicOnly ? `Complete this step by exploring ${currentStep.location}` : undefined}
                                                        >
                                                            <GameIcon icon={isOrganicOnly ? 'map-pin' : 'play'} size={12} />
                                                            {isOrganicOnly
                                                                ? `Explore ${currentStep.location}: ${currentStep.name}`
                                                                : `${isFinalStep ? 'Begin Confrontation' : aq.completedSteps.length === 0 ? 'Begin' : 'Continue'}: ${currentStep.name}`}
                                                        </button>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Quests */}
                {availableQuests.length > 0 && (
                    <div className="quest-section">
                        <h3 className="quest-section-title">
                            <GameIcon icon="compass" size={14} />
                            Available Quests
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

                                        <div className="quest-step-preview">
                                            <GameIcon icon="map-pin" size={10} />
                                            <span>Starts in: {def.steps[0]?.location}</span>
                                        </div>

                                        <button
                                            className="quest-begin-btn quest-accept-btn"
                                            onClick={() => handleStartQuest(def.id)}
                                        >
                                            <GameIcon icon="plus" size={12} />
                                            Accept Quest
                                        </button>
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
                        <p>No quests available yet.</p>
                        <p className="quest-empty-hint">Explore the world to discover questlines.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
