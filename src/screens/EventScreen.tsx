import React, { FC, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ScreenType } from './BaseScreen';
import {
    Stage,
    ActiveEvent,
    EventDefinition,
    EventStep,
    EventChoice,
    EventChatPhase,
    SceneMessage,
    getItemDefinition,
    getRarityColor,
    ConditioningAction,
    CONDITIONING_ACTIONS,
    CONDITIONING_STRATEGIES,
    ActionResult,
    getConditioningTier,
    ConditioningTier,
} from '../Stage';
import { FormattedText, TypewriterText, TypingIndicator } from './SkitText';
import DungeonBg from '../assets/Images/Rooms/dungeon.jpg';
import ManorBg from '../assets/Images/Skits/Manor - Decorated.png';
import WoodsBg from '../assets/Images/Skits/Woods.webp';
import RuinsBg from '../assets/Images/Skits/Deep Ruins.png';

const EVENT_CHAT_BACKGROUNDS: Record<string, string> = {
    'Dungeon': DungeonBg,
    'Manor': ManorBg,
    'Woods': WoodsBg,
    'Ruins': RuinsBg,
};

interface EventScreenProps {
    stage: () => Stage;
    event: ActiveEvent;
    setScreenType: (type: ScreenType) => void;
    onEventUpdate: (event: ActiveEvent | null) => void;
    onEnd: () => void;
}

/** Replace {target} and {pc} placeholders in event text */
function interpolate(text: string, target?: string, pcName?: string): string {
    let result = text;
    if (target) result = result.replace(/\{target\}/g, target);
    if (pcName) result = result.replace(/\{pc\}/g, pcName);
    return result;
}

/** Parse narrative text into styled segments (actions in *, dialogue in "") */
function renderNarrative(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    return lines.map((line, li) => {
        if (!line.trim()) return <br key={li} />;

        const parts: React.ReactNode[] = [];
        // Match *actions* and "dialogue"
        const regex = /(\*[^*]+\*)|("[^"]*")/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
            // Plain text before match
            if (match.index > lastIndex) {
                parts.push(<span key={`${li}-${lastIndex}`}>{line.slice(lastIndex, match.index)}</span>);
            }
            if (match[1]) {
                // Action in asterisks
                parts.push(
                    <em key={`${li}-${match.index}`} className="event-action">
                        {match[1].slice(1, -1)}
                    </em>
                );
            } else if (match[2]) {
                // Dialogue in quotes
                parts.push(
                    <span key={`${li}-${match.index}`} className="event-dialogue">
                        {match[2]}
                    </span>
                );
            }
            lastIndex = match.index + match[0].length;
        }
        // Remainder
        if (lastIndex < line.length) {
            parts.push(<span key={`${li}-end`}>{line.slice(lastIndex)}</span>);
        }

        return <p key={li} className="event-text-line">{parts}</p>;
    });
}

export const EventScreen: FC<EventScreenProps> = ({ stage, event, setScreenType, onEventUpdate, onEnd }) => {
    const [fadeState, setFadeState] = useState<'in' | 'out' | 'none'>('in');

    // ── Event Chat Phase State ──
    const [chatMessages, setChatMessages] = useState<SceneMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    // ── Conditioning UI State ──
    const [actionsOpen, setActionsOpen] = useState(false);
    const [actionResults, setActionResults] = useState<ActionResult[]>([]);
    const [executingAction, setExecutingAction] = useState(false);

    const def: EventDefinition | null = stage().getEventDefinition(event.definitionId);
    if (!def) {
        return (
            <div className="event-screen">
                <div className="event-error">Event not found: {event.definitionId}</div>
                <button className="event-btn" onClick={onEnd}>Close</button>
            </div>
        );
    }

    const currentStep: EventStep = def.steps[event.currentStepId];
    const pcName = stage().currentState.playerCharacter.name;

    // Resolve visible choices (filter by item requirements)
    const visibleChoices: EventChoice[] = useMemo(() => {
        if (!currentStep?.choices) return [];
        return currentStep.choices.filter(c => {
            if (c.requiresItem && !stage().hasItem(c.requiresItem)) return false;
            return true;
        });
    }, [currentStep, event.currentStepId]);

    // Get character portrait
    const speakerAvatar = currentStep?.speaker
        ? stage().getCharacterAvatar(currentStep.speaker)
        : null;

    const targetAvatar = event.target
        ? stage().getCharacterAvatar(event.target)
        : null;

    const handleChoice = (choice: EventChoice) => {
        setFadeState('out');
        setTimeout(() => {
            const updated = stage().advanceEvent(choice.id);
            onEventUpdate(updated);
            setFadeState('in');
        }, 300);
    };

    const handleForceChoice = (choice: EventChoice, result: 'success' | 'failure') => {
        setFadeState('out');
        setTimeout(() => {
            const updated = stage().advanceEvent(choice.id, result);
            onEventUpdate(updated);
            setFadeState('in');
        }, 300);
    };

    const handleContinue = () => {
        setFadeState('out');
        setTimeout(() => {
            const updated = stage().advanceEvent();
            onEventUpdate(updated);
            setFadeState('in');
        }, 300);
    };

    const handleFinish = () => {
        stage().endEvent();
        onEnd();
    };

    // ── Event Chat Phase ──
    const chatPhase = currentStep?.chatPhase;
    const isChatActive = event.chatPhaseActive;
    const chatCompleted = chatPhase && event.chatMessageCount > 0 && !event.chatPhaseActive;

    // Auto-scroll chat messages
    useEffect(() => {
        if (isChatActive) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages.length, isChatActive]);

    // Focus chat input when entering chat mode
    useEffect(() => {
        if (isChatActive) {
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    }, [isChatActive]);

    const handleStartChat = () => {
        stage().startEventChat();
        onEventUpdate(stage().getActiveEvent());
    };

    const handleChatSend = async () => {
        const text = chatInput.trim();
        if (!text || chatSending) return;
        setChatInput('');

        const playerMsg: SceneMessage = { sender: pcName, text };
        setChatMessages(prev => [...prev, playerMsg]);

        setChatSending(true);
        try {
            const reply = await stage().sendEventMessage(text);
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
            }
            onEventUpdate(stage().getActiveEvent());
        } finally {
            setChatSending(false);
            setTimeout(() => chatInputRef.current?.focus(), 50);
        }
    };

    const handleChatKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSend();
        }
    };

    const handleEndChat = () => {
        stage().endEventChat();
        const updated = stage().getActiveEvent();
        if (updated) {
            if (currentStep.nextStep) {
                const advanced = stage().advanceEvent();
                onEventUpdate(advanced);
            } else {
                onEventUpdate(updated);
            }
        }
    };

    // ── Conditioning Actions ──
    const availableActions = useMemo(() => {
        if (!isChatActive) return [];
        return stage().getAvailableActions();
    }, [isChatActive, event.chatMessageCount, actionResults.length]);

    const targetBrainwashing = useMemo(() => {
        return stage().getTargetBrainwashing();
    }, [actionResults.length, event.chatMessageCount]);

    const conditioningTier = useMemo(() => {
        return getConditioningTier(targetBrainwashing);
    }, [targetBrainwashing]);

    const tierColorMap: Record<ConditioningTier, string> = {
        defiant: '#ef4444',
        wavering: '#f97316',
        susceptible: '#eab308',
        broken: '#22c55e',
    };

    const handleConditioningAction = useCallback(async (actionId: string, forceResult?: 'success' | 'failure') => {
        if (executingAction || chatSending) return;
        setExecutingAction(true);

        try {
            const result = forceResult
                ? stage().executeConditioningActionForced(actionId, forceResult === 'success')
                : stage().executeConditioningAction(actionId);

            if (result) {
                setActionResults(prev => [...prev, result]);
                onEventUpdate(stage().getActiveEvent());

                // After the action, trigger a nudge for the NPC to react
                setChatSending(true);
                try {
                    const action = CONDITIONING_ACTIONS[actionId];
                    const actionNarrative = result.success
                        ? `*uses ${action?.label || actionId}*`
                        : `*attempts ${action?.label || actionId}, but fails*`;

                    const reply = await stage().sendEventMessage(actionNarrative);
                    if (reply) {
                        setChatMessages(prev => [...prev, reply]);
                    }
                    onEventUpdate(stage().getActiveEvent());
                } finally {
                    setChatSending(false);
                }
            }
        } finally {
            setExecutingAction(false);
            setTimeout(() => chatInputRef.current?.focus(), 50);
        }
    }, [executingAction, chatSending]);

    if (!currentStep) {
        return (
            <div className="event-screen">
                <div className="event-error">Invalid step: {event.currentStepId}</div>
                <button className="event-btn" onClick={handleFinish}>Close</button>
            </div>
        );
    }

    const interpolatedText = interpolate(currentStep.text, event.target, pcName);

    // ═══════════════════════════════════════════
    // CHAT MODE — Skit-style AI chat within event
    // ═══════════════════════════════════════════
    if (isChatActive && chatPhase) {
        const chatSpeaker = interpolate(chatPhase.speaker, event.target, pcName);
        const chatCharAvatar = stage().getCharacterAvatar(chatSpeaker);
        const chatPcAvatar = stage().currentState.playerCharacter.avatar;
        const chatCharData = stage().getCharacterData(chatSpeaker);
        const canEnd = chatPhase.skippable || event.chatMessageCount >= (chatPhase.minMessages || 0);
        const atMaxMessages = chatPhase.maxMessages ? event.chatMessageCount >= chatPhase.maxMessages : false;
        const bg = EVENT_CHAT_BACKGROUNDS[chatPhase.location || 'Dungeon'] || DungeonBg;
        const isConditioning = event.conditioningStrategy !== undefined;

        // Build combined message list with inline action results
        type ChatItem =
            | { type: 'message'; msg: SceneMessage; index: number }
            | { type: 'action-result'; result: ActionResult; index: number };

        const chatItems: ChatItem[] = [];
        let arIdx = 0;
        // Interleave: place action results before the NPC message they triggered
        for (let i = 0; i < chatMessages.length; i++) {
            const msg = chatMessages[i];
            const isPlayerAction = msg.sender === pcName && msg.text.startsWith('*uses ');
            const isPlayerFail = msg.sender === pcName && msg.text.startsWith('*attempts ');
            if ((isPlayerAction || isPlayerFail) && arIdx < actionResults.length) {
                chatItems.push({ type: 'action-result', result: actionResults[arIdx], index: arIdx });
                arIdx++;
            }
            chatItems.push({ type: 'message', msg, index: i });
        }
        // Any remaining action results (edge case)
        while (arIdx < actionResults.length) {
            chatItems.push({ type: 'action-result', result: actionResults[arIdx], index: arIdx });
            arIdx++;
        }

        return (
            <div
                className="event-screen event-chat-mode skit-screen skit-active"
                style={{ '--char-color': chatCharData?.color || '#c8aa6e' } as React.CSSProperties}
            >
                <div className="skit-background" style={{ backgroundImage: `url(${bg})` }} />
                <div className="skit-overlay" />

                {/* Header */}
                <div className="skit-header">
                    <div className="skit-header-left">
                        <span className="skit-location-badge">{chatPhase.location || 'Dungeon'}</span>
                    </div>
                    <div className="skit-header-center">
                        <img className="skit-header-avatar" src={chatCharAvatar} alt={chatSpeaker} />
                        <span className="skit-header-name">{chatSpeaker}</span>
                    </div>
                    <div className="skit-header-right">
                        {canEnd && (
                            <button className="skit-end-btn" onClick={handleEndChat}>
                                {chatPhase.skippable && event.chatMessageCount < (chatPhase.minMessages || 0)
                                    ? 'Skip ▸'
                                    : 'End Session ▸'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Conditioning progress bar (only for conditioning sessions) */}
                {isConditioning && (
                    <div className="conditioning-progress-header">
                        <div className="conditioning-progress-info">
                            <span className="conditioning-tier-badge" style={{ color: tierColorMap[conditioningTier] }}>
                                {conditioningTier.toUpperCase()}
                            </span>
                            <span className="conditioning-bw-value">{Math.round(targetBrainwashing)}%</span>
                            {event.conditioningStrategy && CONDITIONING_STRATEGIES[event.conditioningStrategy] && (
                                <span className="conditioning-strategy-badge">
                                    {CONDITIONING_STRATEGIES[event.conditioningStrategy].icon}{' '}
                                    {CONDITIONING_STRATEGIES[event.conditioningStrategy].label}
                                </span>
                            )}
                        </div>
                        <div className="conditioning-progress-track">
                            <div
                                className="conditioning-progress-fill"
                                style={{
                                    width: `${targetBrainwashing}%`,
                                    backgroundColor: tierColorMap[conditioningTier],
                                }}
                            />
                            {/* Threshold markers */}
                            <div className="conditioning-threshold-mark" style={{ left: '25%' }} />
                            <div className="conditioning-threshold-mark" style={{ left: '50%' }} />
                            <div className="conditioning-threshold-mark" style={{ left: '75%' }} />
                        </div>
                    </div>
                )}

                {/* Chat messages area */}
                <div className="skit-conversation">
                    {/* Show narrative context at the top */}
                    <div className="event-chat-context">
                        {renderNarrative(interpolatedText)}
                    </div>

                    {chatItems.length === 0 && !chatSending && (
                        <div className="skit-empty-hint">
                            <div className="skit-empty-icon">💬</div>
                            <p>Begin speaking with {chatSpeaker}...</p>
                        </div>
                    )}

                    {chatItems.map((item, idx) => {
                        if (item.type === 'action-result') {
                            const ar = item.result;
                            const action = CONDITIONING_ACTIONS[ar.actionId];
                            return (
                                <div key={`ar-${item.index}`} className={`conditioning-action-result ${ar.success ? 'success' : 'fail'}`}>
                                    <div className="action-result-header">
                                        <span className="action-result-icon">{action?.icon || '⚡'}</span>
                                        <span className="action-result-name">{action?.label || ar.actionId}</span>
                                        <span className={`action-result-verdict ${ar.success ? 'success' : 'fail'}`}>
                                            {ar.success ? '✓ Success' : '✗ Failed'}
                                        </span>
                                    </div>
                                    {ar.skillCheck && (
                                        <div className="action-result-check">
                                            {ar.skillCheck.skill.toUpperCase()} Roll: {ar.skillCheck.roll} vs DC {ar.skillCheck.difficulty}
                                        </div>
                                    )}
                                    <div className="action-result-delta">
                                        {ar.delta > 0 ? `🌀 +${ar.delta}%` : ar.delta === 0 ? 'No effect' : `🌀 ${ar.delta}%`}
                                        <span className="action-result-bw">→ {ar.newBrainwashing}%</span>
                                    </div>
                                    {ar.thresholdCrossed && (
                                        <div className="conditioning-threshold-banner">
                                            ⚡ Threshold Reached: <strong>{ar.thresholdCrossed.toUpperCase()}</strong>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Regular message
                        const msg = item.msg;
                        const isPlayer = msg.sender === pcName;
                        // Hide "system action" messages from the player (the *uses X* messages)
                        if (isPlayer && (msg.text.startsWith('*uses ') || msg.text.startsWith('*attempts '))) {
                            return null;
                        }
                        const msgAvatar = isPlayer ? chatPcAvatar : chatCharAvatar;
                        const isLatestNpc = !isPlayer && idx === chatItems.length - 1;
                        return (
                            <div
                                key={`msg-${item.index}`}
                                className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'}`}
                            >
                                <img className="skit-msg-avatar" src={msgAvatar} alt={msg.sender} />
                                <div className="skit-msg-body">
                                    <span className="skit-msg-name">{msg.sender}</span>
                                    <div className="skit-msg-text">
                                        {isLatestNpc
                                            ? <TypewriterText text={msg.text} speed={40} />
                                            : <FormattedText text={msg.text} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {chatSending && <TypingIndicator name={chatSpeaker} avatar={chatCharAvatar} />}
                    <div ref={chatEndRef} />
                </div>

                {/* Conditioning action panel (collapsible) */}
                {isConditioning && !atMaxMessages && (
                    <div className={`conditioning-actions-panel ${actionsOpen ? 'open' : 'collapsed'}`}>
                        <button
                            className="conditioning-panel-toggle"
                            onClick={() => setActionsOpen(!actionsOpen)}
                        >
                            {actionsOpen ? '▼ Actions' : '▲ Actions'}
                            <span className="conditioning-panel-count">
                                {availableActions.filter(a => !a.locked).length} available
                            </span>
                        </button>
                        {actionsOpen && (
                            <div className="conditioning-actions-grid">
                                {availableActions.map(({ action, locked, lockReason }) => {
                                    const onCooldown = lockReason?.startsWith('Cooldown');
                                    return (
                                        <div key={action.id} className="conditioning-action-slot">
                                            <button
                                                className={`conditioning-action-btn ${locked ? 'locked' : 'available'} category-${action.category}`}
                                                onClick={() => !locked && handleConditioningAction(action.id)}
                                                disabled={locked || executingAction || chatSending}
                                                title={locked ? lockReason : action.tooltip}
                                            >
                                                <span className="cond-action-icon">{action.icon}</span>
                                                <span className="cond-action-label">{action.label}</span>
                                                {action.skillCheck && (
                                                    <span className="cond-action-badge check-badge">
                                                        {action.skillCheck.skill.substring(0, 3).toUpperCase()} {action.skillCheck.difficulty}
                                                    </span>
                                                )}
                                                {action.consumeItem && (
                                                    <span className="cond-action-badge item-badge">
                                                        🧪
                                                    </span>
                                                )}
                                                {locked && (
                                                    <span className="cond-action-lock">
                                                        {onCooldown ? '⏳' : '🔒'}
                                                    </span>
                                                )}
                                            </button>
                                            {/* Debug force buttons */}
                                            {action.skillCheck && !locked && (
                                                <div className="cond-action-debug">
                                                    <button
                                                        className="event-debug-btn debug-success"
                                                        onClick={() => handleConditioningAction(action.id, 'success')}
                                                        title="Debug: Force success"
                                                        disabled={executingAction || chatSending}
                                                    >✓</button>
                                                    <button
                                                        className="event-debug-btn debug-fail"
                                                        onClick={() => handleConditioningAction(action.id, 'failure')}
                                                        title="Debug: Force failure"
                                                        disabled={executingAction || chatSending}
                                                    >✗</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Input bar or max-messages continue */}
                {!atMaxMessages ? (
                    <div className="skit-input-bar">
                        <img className="skit-input-avatar" src={chatPcAvatar} alt={pcName} />
                        <div className="skit-input-wrapper">
                            <textarea
                                ref={chatInputRef}
                                className="skit-input"
                                placeholder={`Speak as ${pcName}...`}
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={handleChatKeyDown}
                                disabled={chatSending || executingAction}
                                rows={1}
                            />
                        </div>
                        <button
                            className={`skit-send-btn ${chatSending ? 'sending' : ''}`}
                            onClick={handleChatSend}
                            disabled={chatSending || executingAction || !chatInput.trim()}
                        >
                            {chatSending ? '...' : '▶'}
                        </button>
                    </div>
                ) : (
                    <div className="event-chat-maxed">
                        <button className="event-btn event-btn-continue" onClick={handleEndChat}>
                            Continue ▸
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // NORMAL MODE — Narrative + choices
    // ═══════════════════════════════════════════

    const showChatButton = chatPhase && !chatCompleted;
    const showFinish = currentStep.isEnding && !showChatButton;
    const showChoices = !showFinish && currentStep.choices && visibleChoices.length > 0;

    return (
        <div className="event-screen">
            {/* Header */}
            <div className="event-header">
                <span className="event-header-icon">{def.icon}</span>
                <span className="event-header-title">{def.name}</span>
                {event.target && (
                    <span className="event-header-target">— {event.target}</span>
                )}
            </div>

            {/* Main content area */}
            <div className={`event-body fade-${fadeState}`}>
                {/* Character portraits */}
                <div className="event-portraits">
                    {speakerAvatar && (
                        <div className="event-portrait speaker">
                            <img src={speakerAvatar} alt={currentStep.speaker} />
                            <span className="event-portrait-name">{currentStep.speaker}</span>
                        </div>
                    )}
                    {targetAvatar && currentStep.speaker !== event.target && (
                        <div className="event-portrait target">
                            <img src={targetAvatar} alt={event.target} />
                            <span className="event-portrait-name">{event.target}</span>
                        </div>
                    )}
                </div>

                {/* Narrative text */}
                <div className="event-narrative">
                    {renderNarrative(interpolatedText)}
                </div>

                {/* Skill check result banner */}
                {event.lastSkillCheck && event.log[event.log.length - 1] === event.currentStepId && (
                    <div className={`event-skill-result ${event.lastSkillCheck.success ? 'success' : 'failure'}`}>
                        <span className="skill-result-label">
                            {event.lastSkillCheck.skill.toUpperCase()} Check
                        </span>
                        <span className="skill-result-roll">
                            Roll: {event.lastSkillCheck.roll} vs DC {event.lastSkillCheck.difficulty}
                        </span>
                        <span className="skill-result-verdict">
                            {event.lastSkillCheck.success ? '✓ Success!' : '✗ Failed'}
                        </span>
                    </div>
                )}

                {/* Effects summary (show what changed) */}
                {currentStep.effects && currentStep.effects.length > 0 && (
                    <div className="event-effects-summary">
                        {currentStep.effects.map((fx, i) => {
                            let label = '';
                            const sign = (fx.value || 0) >= 0 ? '+' : '';
                            switch (fx.type) {
                                case 'modify_brainwashing':
                                    label = `🌀 Brainwashing ${sign}${fx.value}%`;
                                    break;
                                case 'modify_love':
                                    label = `❤️ Love ${sign}${fx.value}`;
                                    break;
                                case 'modify_obedience':
                                    label = `⛓️ Obedience ${sign}${fx.value}`;
                                    break;
                                case 'modify_gold':
                                    label = `🪙 Gold ${sign}${fx.value}`;
                                    break;
                                case 'add_item':
                                    label = `📦 +${fx.value || 1} ${fx.target}`;
                                    break;
                                case 'remove_item':
                                    label = `📦 -${fx.value || 1} ${fx.target}`;
                                    break;
                                case 'modify_skill':
                                    label = `⚡ ${fx.target} ${sign}${fx.value}`;
                                    break;
                                default:
                                    return null;
                            }
                            return (
                                <span key={i} className={`event-effect-tag ${(fx.value || 0) >= 0 ? 'positive' : 'negative'}`}>
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions / choices */}
            <div className="event-actions">
                {showFinish ? (
                    <button className="event-btn event-btn-finish" onClick={handleFinish}>
                        ✦ Finish
                    </button>
                ) : showChoices ? (
                    <div className={`event-choices ${visibleChoices.some(c => CONDITIONING_STRATEGIES[c.id]) ? 'strategy-grid' : ''}`}>
                        {visibleChoices.map((choice) => {
                            const strat = CONDITIONING_STRATEGIES[choice.id];
                            if (strat) {
                                // Strategy card with accent color styling
                                const skillLabel = strat.skillBonus
                                    ? `${strat.skillBonus.skill.charAt(0).toUpperCase() + strat.skillBonus.skill.slice(1)} +${strat.skillBonus.bonus}`
                                    : '';
                                return (
                                    <button
                                        key={choice.id}
                                        className="strategy-card"
                                        style={{ '--strat-color': strat.color } as React.CSSProperties}
                                        onClick={() => handleChoice(choice)}
                                        title={strat.tooltip}
                                    >
                                        <div className="strategy-card-icon">{strat.icon}</div>
                                        <div className="strategy-card-body">
                                            <span className="strategy-card-name">{strat.label}</span>
                                            <span className="strategy-card-desc">{strat.description}</span>
                                        </div>
                                        {skillLabel && (
                                            <span className="strategy-card-bonus">{skillLabel}</span>
                                        )}
                                    </button>
                                );
                            }
                            return (
                            <div key={choice.id} className="event-choice-row">
                                <button
                                    className={`event-btn event-btn-choice ${choice.skillCheck ? 'has-check' : ''}`}
                                    onClick={() => handleChoice(choice)}
                                    title={choice.tooltip || ''}
                                >
                                    <span className="choice-label">{choice.label}</span>
                                    {choice.skillCheck && (
                                        <span className="choice-check-badge">
                                            {choice.skillCheck.skill.toUpperCase()} DC {choice.skillCheck.difficulty}
                                        </span>
                                    )}
                                    {choice.consumeItem && (
                                        <span className="choice-item-cost">
                                            Uses: {getItemDefinition(choice.consumeItem).icon} {choice.consumeItem}
                                        </span>
                                    )}
                                </button>
                                {choice.skillCheck && (
                                    <div className="event-debug-btns">
                                        <button
                                            className="event-debug-btn debug-success"
                                            onClick={() => handleForceChoice(choice, 'success')}
                                            title="Debug: Force success"
                                        >✓</button>
                                        <button
                                            className="event-debug-btn debug-fail"
                                            onClick={() => handleForceChoice(choice, 'failure')}
                                            title="Debug: Force failure"
                                        >✗</button>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                ) : showChatButton ? (
                    <button className="event-btn event-btn-chat" onClick={handleStartChat}>
                        💬 Speak with {interpolate(chatPhase!.speaker, event.target, pcName)}
                    </button>
                ) : (
                    <button className="event-btn event-btn-continue" onClick={handleContinue}>
                        Continue ▸
                    </button>
                )}
            </div>

            {/* Step progress indicator */}
            <div className="event-progress">
                {event.log.map((stepId, i) => (
                    <span
                        key={i}
                        className={`progress-dot ${stepId === event.currentStepId ? 'current' : 'visited'}`}
                    />
                ))}
            </div>
        </div>
    );
};
