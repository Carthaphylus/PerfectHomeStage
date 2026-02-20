import React, { FC, useState, useMemo, useRef, useEffect } from 'react';
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
                                    : 'End Chat ▸'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat messages area */}
                <div className="skit-conversation">
                    {/* Show narrative context at the top */}
                    <div className="event-chat-context">
                        {renderNarrative(interpolatedText)}
                    </div>

                    {chatMessages.length === 0 && !chatSending && (
                        <div className="skit-empty-hint">
                            <div className="skit-empty-icon">💬</div>
                            <p>Begin speaking with {chatSpeaker}...</p>
                        </div>
                    )}

                    {chatMessages.map((msg, i) => {
                        const isPlayer = msg.sender === pcName;
                        const msgAvatar = isPlayer ? chatPcAvatar : chatCharAvatar;
                        const isLatestNpc = !isPlayer && i === chatMessages.length - 1;
                        return (
                            <div
                                key={i}
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
                                disabled={chatSending}
                                rows={1}
                            />
                        </div>
                        <button
                            className={`skit-send-btn ${chatSending ? 'sending' : ''}`}
                            onClick={handleChatSend}
                            disabled={chatSending || !chatInput.trim()}
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
                    <div className="event-choices">
                        {visibleChoices.map((choice) => (
                            <button
                                key={choice.id}
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
                        ))}
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
