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
import { GameIcon } from './GameIcon';
import {
    Music, Orbit, Cloud, Eye, Wand2, Link2, Flame, FlaskConical,
    Droplets, Sun, Feather, Gem, Heart, Crown, Sparkles, Waves,
    Brain, Ghost, Skull, Shield, Star, Zap, Wind, CircleDot,
    ScanEye, TestTubes, Moon, Hand, MessageCircle,
    Pencil, RotateCcw, Check, X, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';

// ── Spell Icon Component ──
const SPELL_ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
    music: Music,
    orbit: Orbit,
    cloud: Cloud,
    eye: Eye,
    wand: Wand2,
    link: Link2,
    flame: Flame,
    flask: FlaskConical,
    droplets: Droplets,
    sun: Sun,
    feather: Feather,
    gem: Gem,
    heart: Heart,
    crown: Crown,
    sparkles: Sparkles,
    waves: Waves,
    brain: Brain,
    ghost: Ghost,
    skull: Skull,
    shield: Shield,
    star: Star,
    zap: Zap,
    wind: Wind,
    'circle-dot': CircleDot,
    'scan-eye': ScanEye,
    'test-tubes': TestTubes,
    moon: Moon,
    hand: Hand,
    'message-circle': MessageCircle,
};

const SpellIcon: FC<{ icon: string; size?: number; className?: string }> = ({ icon, size = 16, className }) => {
    const IconComponent = SPELL_ICON_MAP[icon];
    if (!IconComponent) return <span className={className}>{icon}</span>;
    return <IconComponent size={size} className={className} />;
};
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
    const [chatStarted, setChatStarted] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    // ── Conditioning UI State ──
    const [actionsOpen, setActionsOpen] = useState(false);
    const [actionResults, setActionResults] = useState<ActionResult[]>([]);
    const [executingAction, setExecutingAction] = useState(false);
    const [attachedAction, setAttachedAction] = useState<{ action: ConditioningAction; forceResult?: 'success' | 'failure' } | null>(null);

    // ── Edit / Regenerate State ──
    const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [npcAlternatives, setNpcAlternatives] = useState<SceneMessage[]>([]);
    const [currentAltIndex, setCurrentAltIndex] = useState(0);

    // ── Post-scene summary state ──
    const [sceneSummary, setSceneSummary] = useState<string | null>(null);
    const [summaryEditing, setSummaryEditing] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [generatingSummary, setGeneratingSummary] = useState(false);

    // ── Debug context viewer ──
    const [debugContextText, setDebugContextText] = useState<string | null>(null);

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
    // Chat is complete once it was started and then ended, regardless of message count
    const chatCompleted = chatPhase && !event.chatPhaseActive && chatStarted;

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
        setChatStarted(true);
        stage().startEventChat();
        onEventUpdate(stage().getActiveEvent());
    };

    const handleChatSend = async () => {
        const text = chatInput.trim();
        if (!text || chatSending) return;
        setChatInput('');

        // Execute attached conditioning action first, if any
        let actionResult: ActionResult | null = null;
        const currentAttached = attachedAction;
        if (currentAttached) {
            setAttachedAction(null);
            setExecutingAction(true);
            try {
                actionResult = currentAttached.forceResult
                    ? stage().executeConditioningActionForced(currentAttached.action.id, currentAttached.forceResult === 'success')
                    : stage().executeConditioningAction(currentAttached.action.id);
                if (actionResult) {
                    setActionResults(prev => [...prev, actionResult!]);
                    onEventUpdate(stage().getActiveEvent());
                }
            } finally {
                setExecutingAction(false);
            }
        }

        // Build the message text — include action context for the LLM
        let messageText = text;
        if (currentAttached && actionResult) {
            const actionNarrative = actionResult.success
                ? `*uses ${currentAttached.action.label}*`
                : `*attempts ${currentAttached.action.label}, but fails*`;
            messageText = `${actionNarrative} ${text}`;
        }

        const playerMsg: SceneMessage = { sender: pcName, text: messageText };
        setChatMessages(prev => [...prev, playerMsg]);

        // Clear alternatives from previous position
        setNpcAlternatives([]);
        setCurrentAltIndex(0);

        setChatSending(true);
        try {
            const reply = await stage().sendEventMessage(messageText);
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

    // ── Edit / Regenerate Handlers ──

    const handleStartEdit = (msgIndex: number) => {
        const msg = chatMessages[msgIndex];
        if (!msg) return;
        // Strip action prefix for player messages
        let text = msg.text;
        if (msg.sender === pcName) {
            text = text.replace(/^\*uses [^*]+\*\s*/, '').replace(/^\*attempts [^*]+, but fails\*\s*/, '');
        }
        setEditingMsgIndex(msgIndex);
        setEditText(text);
    };

    const handleCancelEdit = () => {
        setEditingMsgIndex(null);
        setEditText('');
    };

    const handleSaveEdit = async () => {
        if (editingMsgIndex === null || chatSending || regenerating) return;
        const newText = editText.trim();
        if (!newText) return;

        const oldMsg = chatMessages[editingMsgIndex];
        if (!oldMsg) return;
        const isPlayerMsg = oldMsg.sender === pcName;

        if (!isPlayerMsg) {
            // NPC message edit: just update the text locally, no re-send
            const updated = [...chatMessages];
            updated[editingMsgIndex] = { ...oldMsg, text: newText, _edited: true };
            setChatMessages(updated);
            stage().setEventMessages(updated);
            setEditingMsgIndex(null);
            setEditText('');
            // Clear alternatives since we manually edited
            setNpcAlternatives([]);
            setCurrentAltIndex(0);
            return;
        }

        // Player message edit: preserve action prefix, truncate after, re-send for new NPC reply
        const actionMatch = oldMsg.text.match(/^(\*(?:uses|attempts) [^*]+(?:, but fails)?\*)\s*/);
        const fullText = actionMatch ? `${actionMatch[1]} ${newText}` : newText;

        const updatedMessages = chatMessages.slice(0, editingMsgIndex);
        updatedMessages.push({ sender: oldMsg.sender, text: fullText });
        setChatMessages(updatedMessages);
        stage().setEventMessages(updatedMessages);

        setEditingMsgIndex(null);
        setEditText('');
        setNpcAlternatives([]);
        setCurrentAltIndex(0);

        // Re-send to get a new NPC reply
        setRegenerating(true);
        setChatSending(true);
        try {
            const reply = await stage().regenerateEventResponse();
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
            }
            onEventUpdate(stage().getActiveEvent());
        } finally {
            setRegenerating(false);
            setChatSending(false);
        }
    };

    const handleRegenerate = async () => {
        if (chatSending || regenerating || chatMessages.length === 0) return;

        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg.sender === pcName) return;

        // Save the current response as an alternative before regenerating
        setNpcAlternatives(prev => {
            if (prev.length === 0) {
                // First regen: save the original as alt[0]
                return [lastMsg];
            }
            return prev;
        });

        // Remove last NPC message and re-send
        const trimmed = chatMessages.slice(0, -1);
        setChatMessages(trimmed);
        stage().setEventMessages(trimmed);

        setRegenerating(true);
        setChatSending(true);
        try {
            const reply = await stage().regenerateEventResponse();
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
                // Add new reply to alternatives
                setNpcAlternatives(prev => {
                    const newAlts = [...prev, reply];
                    setCurrentAltIndex(newAlts.length - 1);
                    return newAlts;
                });
            }
            onEventUpdate(stage().getActiveEvent());
        } finally {
            setRegenerating(false);
            setChatSending(false);
        }
    };

    const handleSwipeAlt = (direction: -1 | 1) => {
        if (npcAlternatives.length <= 1) return;
        const newIdx = Math.max(0, Math.min(npcAlternatives.length - 1, currentAltIndex + direction));
        if (newIdx === currentAltIndex) return;
        setCurrentAltIndex(newIdx);

        // Swap the displayed NPC message
        const alt = npcAlternatives[newIdx];
        setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = alt;
            return updated;
        });
        // Sync with stage
        stage().setEventMessages([...chatMessages.slice(0, -1), alt]);
    };

    const handleEndChat = async () => {
        // Save messages before ending (endEventChat clears them)
        const messagesSnapshot = [...chatMessages];
        const speakerName = chatPhase?.speaker
            ? interpolate(chatPhase.speaker, event.target, pcName)
            : null;

        // Generate scene summary if there are messages and we know the speaker
        if (messagesSnapshot.length > 0 && speakerName) {
            setGeneratingSummary(true);
            try {
                const summary = await stage().generateSceneSummary(speakerName, messagesSnapshot);
                if (summary) {
                    setSceneSummary(summary);
                    setSummaryText(summary);
                }
            } catch (e) {
                console.error('[EventScreen] Summary generation failed:', e);
            }
            setGeneratingSummary(false);
        }

        stage().endEventChat();
        const updated = stage().getActiveEvent();
        if (updated) {
            onEventUpdate(updated);
        }
    };

    /** Accept the scene summary and save to character history */
    const handleAcceptSummary = () => {
        const speakerName = chatPhase?.speaker
            ? interpolate(chatPhase.speaker, event.target, pcName)
            : null;
        if (speakerName && summaryText.trim()) {
            stage().updateCharacterHistory(speakerName, summaryText.trim());
        }
        setSceneSummary(null);
        setSummaryEditing(false);

        // Now advance if there's a next step
        if (currentStep.nextStep) {
            const advanced = stage().advanceEvent();
            onEventUpdate(advanced);
        }
    };

    /** Skip saving the summary */
    const handleSkipSummary = () => {
        setSceneSummary(null);
        setSummaryEditing(false);

        if (currentStep.nextStep) {
            const advanced = stage().advanceEvent();
            onEventUpdate(advanced);
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

    const handleAttachAction = useCallback((actionId: string, forceResult?: 'success' | 'failure') => {
        const action = CONDITIONING_ACTIONS[actionId];
        if (!action) return;
        // If already attached the same action, detach it (toggle)
        if (attachedAction && attachedAction.action.id === actionId && attachedAction.forceResult === forceResult) {
            setAttachedAction(null);
            return;
        }
        setAttachedAction({ action, forceResult });
        setTimeout(() => chatInputRef.current?.focus(), 50);
    }, [attachedAction]);

    const handleDetachAction = useCallback(() => {
        setAttachedAction(null);
    }, []);

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
        // Interleave: place action results before the player message that contains the action text
        for (let i = 0; i < chatMessages.length; i++) {
            const msg = chatMessages[i];
            const isPlayerAction = msg.sender === pcName && (msg.text.startsWith('*uses ') || msg.text.includes('*uses '));
            const isPlayerFail = msg.sender === pcName && (msg.text.startsWith('*attempts ') || msg.text.includes('*attempts '));
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
                        <button
                            className={`nsfw-toggle-btn ${stage().currentState.nsfwMode ? 'nsfw-active' : ''}`}
                            onClick={() => {
                                stage().currentState.nsfwMode = !stage().currentState.nsfwMode;
                                onEventUpdate(stage().getActiveEvent());
                            }}
                            title={stage().currentState.nsfwMode ? 'NSFW mode ON — click to disable' : 'NSFW mode OFF — click to enable'}
                        >
                            <Flame size={12} />
                        </button>
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
                                <span className="conditioning-strategy-badge" style={{ color: CONDITIONING_STRATEGIES[event.conditioningStrategy].color }}>
                                    <GameIcon icon={CONDITIONING_STRATEGIES[event.conditioningStrategy].icon} size={10} />{' '}
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
                            <div className="skit-empty-icon"><GameIcon icon="message-circle" size={24} className="icon-gold" /></div>
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
                                        <span className="action-result-icon"><SpellIcon icon={action?.icon || 'zap'} size={12} /></span>
                                        <span className="action-result-name">{action?.label || ar.actionId}</span>
                                        <span className={`action-result-verdict ${ar.success ? 'success' : 'fail'}`}>
                                            {ar.success ? <><GameIcon icon="check" size={10} /> Success</> : <><GameIcon icon="x" size={10} /> Failed</>}
                                        </span>
                                    </div>
                                    {ar.skillCheck && (
                                        <div className="action-result-check">
                                            {ar.skillCheck.skill.toUpperCase()} Roll: {ar.skillCheck.roll} vs DC {ar.skillCheck.difficulty}
                                        </div>
                                    )}
                                    <div className="action-result-delta">
                                        <span className="delta-icon"><GameIcon icon="orbit" size={11} className="icon-purple" /></span>
                                        {ar.delta > 0 ? ` +${ar.delta}%` : ar.delta === 0 ? 'No effect' : ` ${ar.delta}%`}
                                        <span className="action-result-bw">→ {ar.newBrainwashing}%</span>
                                    </div>
                                    {ar.thresholdCrossed && (
                                        <div className="conditioning-threshold-banner">
                                            <GameIcon icon="zap" size={12} className="icon-yellow" /> Threshold Reached: <strong>{ar.thresholdCrossed.toUpperCase()}</strong>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Regular message
                        const msg = item.msg;
                        const isPlayer = msg.sender === pcName;
                        // Strip the action prefix from display — the action result banner shows it
                        let displayText = msg.text;
                        if (isPlayer) {
                            displayText = displayText.replace(/^\*uses [^*]+\*\s*/, '').replace(/^\*attempts [^*]+, but fails\*\s*/, '');
                            if (!displayText.trim()) return null; // pure action message with no text
                        }
                        const msgAvatar = isPlayer ? chatPcAvatar : chatCharAvatar;
                        const isLatestNpc = !isPlayer && idx === chatItems.length - 1;
                        const isEditing = editingMsgIndex === item.index;
                        const isLastNpcMsg = !isPlayer && item.index === chatMessages.length - 1;
                        const canEdit = !chatSending && !regenerating && editingMsgIndex === null;
                        const canRegen = isLastNpcMsg && !chatSending && !regenerating && editingMsgIndex === null;
                        const hasAlts = isLastNpcMsg && npcAlternatives.length > 1;

                        return (
                            <div
                                key={`msg-${item.index}`}
                                className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'} ${isEditing ? 'skit-msg-editing' : ''}`}
                            >
                                <img className="skit-msg-avatar" src={msgAvatar} alt={msg.sender} />
                                <div className="skit-msg-body">
                                    <span className="skit-msg-name">{msg.sender}</span>
                                    <div
                                        key={isEditing ? `edit-${item.index}` : `display-${item.index}`}
                                        className={`skit-msg-text ${isEditing ? 'skit-msg-text-editing' : ''}`}
                                        contentEditable={isEditing}
                                        suppressContentEditableWarning
                                        ref={el => {
                                            if (isEditing && el) {
                                                // Set initial content and focus
                                                if (el.innerText !== editText) {
                                                    el.innerText = editText;
                                                }
                                                if (document.activeElement !== el) {
                                                    el.focus();
                                                    // Move cursor to end
                                                    const range = document.createRange();
                                                    range.selectNodeContents(el);
                                                    range.collapse(false);
                                                    const sel = window.getSelection();
                                                    sel?.removeAllRanges();
                                                    sel?.addRange(range);
                                                }
                                            }
                                        }}
                                        onInput={e => {
                                            if (isEditing) {
                                                setEditText((e.target as HTMLDivElement).innerText);
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if (!isEditing) return;
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveEdit();
                                            }
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    >
                                        {!isEditing && (
                                            (isLatestNpc && !msg._edited)
                                                ? <TypewriterText text={msg.text} speed={40} />
                                                : <FormattedText text={isPlayer ? displayText : msg.text} />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="skit-msg-edit-buttons">
                                            <button className="skit-edit-btn skit-edit-save" onClick={handleSaveEdit} title={isPlayer ? 'Save & regenerate' : 'Save edit'}>
                                                <Check size={11} /> Save
                                            </button>
                                            <button className="skit-edit-btn skit-edit-cancel" onClick={handleCancelEdit} title="Cancel">
                                                <X size={11} /> Cancel
                                            </button>
                                        </div>
                                    )}
                                    {/* Edit / Regenerate / Swipe controls */}
                                    {!isEditing && canEdit && (
                                        <div className="skit-msg-actions">
                                            <button className="skit-msg-action-btn" onClick={() => handleStartEdit(item.index)} title="Edit message">
                                                <Pencil size={10} />
                                            </button>
                                            {canRegen && (
                                                <button className="skit-msg-action-btn" onClick={handleRegenerate} title="Regenerate response">
                                                    <RotateCcw size={10} />
                                                </button>
                                            )}
                                            {!isPlayer && msg._debugContext && (
                                                <button
                                                    className="skit-msg-action-btn debug-context-btn"
                                                    onClick={() => setDebugContextText(msg._debugContext || null)}
                                                    title="View generation context"
                                                >
                                                    <FileText size={10} />
                                                </button>
                                            )}
                                            {hasAlts && (
                                                <div className="skit-msg-swipe">
                                                    <button
                                                        className="skit-msg-action-btn"
                                                        onClick={() => handleSwipeAlt(-1)}
                                                        disabled={currentAltIndex <= 0}
                                                        title="Previous response"
                                                    >
                                                        <ChevronLeft size={10} />
                                                    </button>
                                                    <span className="skit-msg-swipe-counter">
                                                        {currentAltIndex + 1}/{npcAlternatives.length}
                                                    </span>
                                                    <button
                                                        className="skit-msg-action-btn"
                                                        onClick={() => handleSwipeAlt(1)}
                                                        disabled={currentAltIndex >= npcAlternatives.length - 1}
                                                        title="Next response"
                                                    >
                                                        <ChevronRight size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {chatSending && <TypingIndicator name={chatSpeaker} avatar={chatCharAvatar} />}
                    <div ref={chatEndRef} />
                </div>

                {/* Grimoire action panel (collapsible) */}
                {isConditioning && !atMaxMessages && (
                    <div className={`grimoire-panel ${actionsOpen ? 'open' : 'collapsed'}`}>
                        <button
                            className="grimoire-toggle"
                            onClick={() => setActionsOpen(!actionsOpen)}
                        >
                            <span className="grimoire-toggle-icon">{actionsOpen ? <Sparkles size={12} /> : <Sparkles size={12} />}</span>
                            <span className="grimoire-toggle-label">{actionsOpen ? 'Grimoire' : 'Grimoire'}</span>
                            <span className="grimoire-toggle-count">
                                {availableActions.filter(a => !a.locked).length} spells
                            </span>
                            <span className="grimoire-toggle-arrow">{actionsOpen ? '▾' : '▴'}</span>
                        </button>
                        {actionsOpen && (() => {
                            const categoryOrder: { key: string; label: string; icon: string }[] = [
                                { key: 'enchantment', label: 'Enchantment', icon: 'sparkles' },
                                { key: 'hex', label: 'Hexes', icon: 'skull' },
                                { key: 'binding', label: 'Binding', icon: 'link' },
                                { key: 'alchemy', label: 'Alchemy', icon: 'flask' },
                                { key: 'beguile', label: 'Beguile', icon: 'heart' },
                            ];
                            const grouped = categoryOrder.map(cat => ({
                                ...cat,
                                actions: availableActions.filter(a => a.action.category === cat.key),
                            })).filter(cat => cat.actions.length > 0);

                            return (
                                <div className="grimoire-pages">
                                    {grouped.map(cat => (
                                        <div key={cat.key} className={`grimoire-chapter chapter-${cat.key}`}>
                                            <div className="grimoire-chapter-header">
                                                <span className="grimoire-chapter-divider" />
                                                <span className="grimoire-chapter-icon"><SpellIcon icon={cat.icon} size={10} /></span>
                                                <span className="grimoire-chapter-title">{cat.label}</span>
                                                <span className="grimoire-chapter-divider" />
                                            </div>
                                            <div className="grimoire-spells">
                                                {cat.actions.map(({ action, locked, lockReason }) => {
                                                    const onCooldown = lockReason?.startsWith('Cooldown');
                                                    const isAttached = attachedAction?.action.id === action.id && !attachedAction?.forceResult;
                                                    return (
                                                        <div key={action.id} className="grimoire-spell-slot">
                                                            <button
                                                                className={`grimoire-spell ${locked ? 'locked' : 'available'} chapter-${action.category} ${isAttached ? 'attached' : ''}`}
                                                                onClick={() => !locked && handleAttachAction(action.id)}
                                                                disabled={locked || executingAction || chatSending}
                                                                title={locked ? lockReason : action.tooltip}
                                                            >
                                                                <span className="spell-icon"><SpellIcon icon={action.icon} size={18} /></span>
                                                                <span className="spell-name">{action.label}</span>
                                                                {action.skillCheck && (
                                                                    <span className="spell-dc">
                                                                        {action.skillCheck.skill.substring(0, 3).toUpperCase()} {action.skillCheck.difficulty}
                                                                    </span>
                                                                )}
                                                                {action.consumeItem && (
                                                                    <span className="spell-cost"><FlaskConical size={10} /></span>
                                                                )}
                                                                {locked && (
                                                                    <span className="spell-lock">
                                                                        {onCooldown ? <GameIcon icon="hourglass" size={10} className="icon-muted" /> : <GameIcon icon="lock" size={10} className="icon-muted" />}
                                                                    </span>
                                                                )}
                                                                {isAttached && (
                                                                    <span className="spell-attached-glow" />
                                                                )}
                                                            </button>
                                                            {/* Debug force buttons */}
                                                            {action.skillCheck && !locked && (
                                                                <div className="spell-debug">
                                                                    <button
                                                                        className="event-debug-btn debug-success"
                                                                        onClick={() => handleAttachAction(action.id, 'success')}
                                                                        title="Debug: Force success"
                                                                        disabled={executingAction || chatSending}
                                                                    ><GameIcon icon="check" size={12} /></button>
                                                                    <button
                                                                        className="event-debug-btn debug-fail"
                                                                        onClick={() => handleAttachAction(action.id, 'failure')}
                                                                        title="Debug: Force failure"
                                                                        disabled={executingAction || chatSending}
                                                                    ><GameIcon icon="x" size={12} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Input bar or max-messages continue */}
                {!atMaxMessages ? (
                    <div className="skit-input-bar">
                        <img className="skit-input-avatar" src={chatPcAvatar} alt={pcName} />
                        <div className="skit-input-wrapper">
                            {/* Attached action indicator */}
                            {attachedAction && (
                                <div className={`attached-action-tag category-${attachedAction.action.category}`}>
                                    <span className="attached-action-icon"><SpellIcon icon={attachedAction.action.icon} size={16} /></span>
                                    <span className="attached-action-name">{attachedAction.action.label}</span>
                                    {attachedAction.forceResult && (
                                        <span className={`attached-action-force ${attachedAction.forceResult}`}>
                                            [{attachedAction.forceResult}]
                                        </span>
                                    )}
                                    <button className="attached-action-remove" onClick={handleDetachAction} title="Remove action"><GameIcon icon="x" size={12} /></button>
                                </div>
                            )}
                            <textarea
                                ref={chatInputRef}
                                className="skit-input"
                                placeholder={attachedAction
                                    ? `Speak while using ${attachedAction.action.label}...`
                                    : `Speak as ${pcName}...`}
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={handleChatKeyDown}
                                disabled={chatSending || executingAction}
                                rows={1}
                            />
                        </div>
                        <button
                            className={`skit-send-btn ${chatSending ? 'sending' : ''} ${attachedAction ? 'has-action' : ''}`}
                            onClick={handleChatSend}
                            disabled={chatSending || executingAction || !chatInput.trim()}
                        >
                            {chatSending ? '...' : attachedAction ? <GameIcon icon="zap" size={14} /> : '▶'}
                        </button>
                    </div>
                ) : (
                    <div className="event-chat-maxed">
                        <button className="event-btn event-btn-continue" onClick={handleEndChat}>
                            Continue ▸
                        </button>
                    </div>
                )}

                {/* Debug context viewer overlay */}
                {debugContextText !== null && (
                    <div className="debug-context-overlay" onClick={() => setDebugContextText(null)}>
                        <div className="debug-context-panel" onClick={e => e.stopPropagation()}>
                            <div className="debug-context-header">
                                <span><FileText size={12} /> Generation Context</span>
                                <button className="debug-context-close" onClick={() => setDebugContextText(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                            <pre className="debug-context-body">{debugContextText}</pre>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // POST-SCENE SUMMARY — shown after chat ends
    // ═══════════════════════════════════════════
    if ((sceneSummary !== null || generatingSummary) && chatCompleted) {
        const speakerName = chatPhase?.speaker
            ? interpolate(chatPhase.speaker, event.target, pcName)
            : 'Character';
        return (
            <div className="event-screen">
                <div className="event-header">
                    <span className="event-header-icon"><GameIcon icon={def.icon} size={16} /></span>
                    <span className="event-header-title">Scene Summary</span>
                    <span className="event-header-target">— {speakerName}</span>
                </div>
                <div className="event-body fade-in">
                    <div className="scene-summary-section">
                        <p className="scene-summary-label">
                            This summary will be added to {speakerName}'s memory:
                        </p>
                        {generatingSummary ? (
                            <div className="scene-summary-loading">
                                <TypingIndicator name={speakerName} avatar={''} />
                                <span>Generating summary...</span>
                            </div>
                        ) : summaryEditing ? (
                            <textarea
                                className="scene-summary-textarea"
                                value={summaryText}
                                onChange={e => setSummaryText(e.target.value)}
                                rows={5}
                            />
                        ) : (
                            <div className="scene-summary-preview" onClick={() => setSummaryEditing(true)}>
                                <FormattedText text={summaryText} />
                                <span className="scene-summary-edit-hint">
                                    <Pencil size={10} /> Click to edit
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="event-actions">
                    {!generatingSummary && (
                        <>
                            <button className="event-btn event-btn-continue" onClick={handleAcceptSummary}>
                                <Check size={12} /> Save & Continue
                            </button>
                            <button className="event-btn event-btn-choice" onClick={handleSkipSummary}>
                                <X size={12} /> Skip
                            </button>
                        </>
                    )}
                </div>
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
                <span className="event-header-icon"><GameIcon icon={def.icon} size={16} /></span>
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
                            {event.lastSkillCheck.success ? <><GameIcon icon="check" size={10} /> Success!</> : <><GameIcon icon="x" size={10} /> Failed</>}
                        </span>
                    </div>
                )}

                {/* Effects summary (show what changed) */}
                {currentStep.effects && currentStep.effects.length > 0 && (
                    <div className="event-effects-summary">
                        {currentStep.effects.map((fx, i) => {
                            let iconKey = '';
                            let text = '';
                            const sign = (fx.value || 0) >= 0 ? '+' : '';
                            switch (fx.type) {
                                case 'modify_brainwashing':
                                    iconKey = 'orbit'; text = `Brainwashing ${sign}${fx.value}%`;
                                    break;
                                case 'modify_love':
                                    iconKey = 'heart'; text = `Love ${sign}${fx.value}`;
                                    break;
                                case 'modify_obedience':
                                    iconKey = 'link'; text = `Obedience ${sign}${fx.value}`;
                                    break;
                                case 'modify_gold':
                                    iconKey = 'coins'; text = `Gold ${sign}${fx.value}`;
                                    break;
                                case 'add_item':
                                    iconKey = 'package'; text = `+${fx.value || 1} ${fx.target}`;
                                    break;
                                case 'remove_item':
                                    iconKey = 'package'; text = `-${fx.value || 1} ${fx.target}`;
                                    break;
                                case 'modify_skill':
                                    iconKey = 'zap'; text = `${fx.target} ${sign}${fx.value}`;
                                    break;
                                default:
                                    return null;
                            }
                            return (
                                <span key={i} className={`event-effect-tag ${(fx.value || 0) >= 0 ? 'positive' : 'negative'}`}>
                                    <GameIcon icon={iconKey} size={10} className="effect-tag-icon" /> {text}
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
                        <GameIcon icon="sparkle" size={12} /> Finish
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
                                        <div className="strategy-card-icon"><GameIcon icon={strat.icon} size={20} /></div>
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
                                        ><GameIcon icon="check" size={12} /></button>
                                        <button
                                            className="event-debug-btn debug-fail"
                                            onClick={() => handleForceChoice(choice, 'failure')}
                                            title="Debug: Force failure"
                                        ><GameIcon icon="x" size={12} /></button>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                ) : showChatButton ? (
                    <button className="event-btn event-btn-chat" onClick={handleStartChat}>
                        <GameIcon icon="message-circle" size={12} /> Speak with {interpolate(chatPhase!.speaker, event.target, pcName)}
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
