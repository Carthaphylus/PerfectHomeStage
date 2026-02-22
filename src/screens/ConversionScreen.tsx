import React, { FC, useState, useRef, useEffect, useMemo } from 'react';
import { ScreenType } from './BaseScreen';
import {
    Stage,
    SceneMessage,
    CONVERSION_ARCHETYPES,
    ConversionArchetype,
    getConversionArchetype,
    Hero,
} from '../Stage';
import { FormattedText, TypewriterText, TypingIndicator } from './SkitText';
import { GameIcon } from './GameIcon';
import { Pencil, Check, X, ChevronLeft, ChevronRight, RotateCcw, Flame, FileText } from 'lucide-react';

// ── Phase of the conversion flow ──
type ConversionPhase =
    | 'choose_mode'       // Choose between predefined or chat
    | 'pick_archetype'    // Browse and pick from predefined archetypes
    | 'final_session'     // The final conditioning chat scene
    | 'converting'        // Processing the conversion
    | 'complete';         // Done — show result

interface ConversionScreenProps {
    stage: () => Stage;
    heroName: string;
    setScreenType: (type: ScreenType) => void;
    onComplete: () => void;
}

// Category metadata for grouping
const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
    obedience: { label: 'Obedience', icon: 'link', color: '#a78bfa' },
    devotion: { label: 'Devotion', icon: 'heart', color: '#fb7185' },
    pleasure: { label: 'Pleasure', icon: 'flame', color: '#f43f5e' },
    utility: { label: 'Utility', icon: 'wrench', color: '#34d399' },
    arcane: { label: 'Arcane', icon: 'sparkles', color: '#818cf8' },
    dark: { label: 'Dark', icon: 'skull', color: '#94a3b8' },
};

export const ConversionScreen: FC<ConversionScreenProps> = ({
    stage,
    heroName,
    setScreenType,
    onComplete,
}) => {
    const [phase, setPhase] = useState<ConversionPhase>('choose_mode');
    const [selectedArchetype, setSelectedArchetype] = useState<ConversionArchetype | null>(null);
    const [previewArchetype, setPreviewArchetype] = useState<ConversionArchetype | null>(null);
    const [chatMode, setChatMode] = useState<'predefined' | 'freeform' | null>(null);

    // Chat state
    const [chatMessages, setChatMessages] = useState<SceneMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    // ── Edit / Regenerate State ──
    const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [npcAlternatives, setNpcAlternatives] = useState<SceneMessage[]>([]);
    const [currentAltIndex, setCurrentAltIndex] = useState(0);
    const [debugContextText, setDebugContextText] = useState<string | null>(null);

    // Archetype confirmation
    const [confirmArchetype, setConfirmArchetype] = useState<ConversionArchetype | null>(null);

    // Completion state
    const [conversionResult, setConversionResult] = useState<{
        description: string;
        traits: string[];
        originalTraits: string[];
        archetypeName?: string;
        archetypeId?: string;
        archetypeColor?: string;
    } | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState('');

    const hero = stage().currentState.heroes[heroName];
    const pcName = stage().currentState.playerCharacter.name;
    const charAvatar = stage().getCharacterAvatar(heroName);
    const pcAvatar = stage().currentState.playerCharacter.avatar;

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length]);

    // Focus input
    useEffect(() => {
        if (phase === 'final_session') {
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    }, [phase]);

    // ═══════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════

    const handleChooseMode = (mode: 'predefined' | 'freeform') => {
        setChatMode(mode);
        if (mode === 'predefined') {
            setPhase('pick_archetype');
        } else {
            setPhase('final_session');
        }
    };

    const handleSelectArchetype = (archetype: ConversionArchetype) => {
        setConfirmArchetype(archetype);
    };

    const handleArchetypeConfirm = async () => {
        if (!confirmArchetype) return;
        const archetype = confirmArchetype;
        setConfirmArchetype(null);
        setSelectedArchetype(archetype);
        setChatMode('predefined');
        setIsConverting(true);
        setPhase('converting');

        // Capture original traits before the hero is deleted
        const heroTraits = hero ? [...hero.traits] : [];

        // Generate personalized description via LLM
        setIsGenerating(true);
        const narrative = await stage().generateArchetypeNarrative(heroName, archetype.id);
        const finalDescription = narrative || archetype.personalityRewrite;
        setIsGenerating(false);

        // Convert with the personalized description
        const success = stage().convertCaptiveWithArchetype(heroName, archetype.id, finalDescription);
        if (success) {
            setConversionResult({
                description: finalDescription,
                traits: archetype.grantedTraits,
                originalTraits: heroTraits,
                archetypeName: archetype.name,
                archetypeId: archetype.id,
                archetypeColor: archetype.color,
            });
            setEditedDescription(finalDescription);
        }
        setPhase('complete');
        setIsConverting(false);
    };

    const handleRegenerateDescription = async () => {
        if (!conversionResult?.archetypeId || isGenerating) return;
        setIsGenerating(true);
        const narrative = await stage().generateArchetypeNarrative(heroName, conversionResult.archetypeId);
        if (narrative) {
            setEditedDescription(narrative);
            setConversionResult(prev => prev ? { ...prev, description: narrative } : prev);
            stage().updateServantDescription(heroName, narrative);
        }
        setIsGenerating(false);
    };

    const handleSaveDescription = () => {
        if (conversionResult) {
            setConversionResult(prev => prev ? { ...prev, description: editedDescription } : prev);
            stage().updateServantDescription(heroName, editedDescription);
        }
        setEditingDescription(false);
    };

    const handleCancelDescriptionEdit = () => {
        setEditedDescription(conversionResult?.description || '');
        setEditingDescription(false);
    };

    const handleChatSend = async () => {
        const text = chatInput.trim();
        if (!text || chatSending) return;
        setChatInput('');

        const playerMsg: SceneMessage = { sender: pcName, text };
        const updatedMessages = [...chatMessages, playerMsg];
        setChatMessages(updatedMessages);

        setChatSending(true);
        try {
            const reply = await stage().generateConversionResponse(
                heroName,
                selectedArchetype?.id || null,
                text,
                updatedMessages
            );
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
            }
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

    // ── Edit / Regenerate Handlers (mirroring EventScreen) ──

    const handleStartEdit = (msgIndex: number) => {
        const msg = chatMessages[msgIndex];
        if (!msg) return;
        setEditingMsgIndex(msgIndex);
        setEditText(msg.text);
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
            // NPC message edit: just update the text locally
            const updated = [...chatMessages];
            updated[editingMsgIndex] = { ...oldMsg, text: newText, _edited: true };
            setChatMessages(updated);
            setEditingMsgIndex(null);
            setEditText('');
            setNpcAlternatives([]);
            setCurrentAltIndex(0);
            return;
        }

        // Player message edit: truncate after, re-send for new NPC reply
        const updatedMessages = chatMessages.slice(0, editingMsgIndex);
        updatedMessages.push({ sender: oldMsg.sender, text: newText });
        setChatMessages(updatedMessages);

        setEditingMsgIndex(null);
        setEditText('');
        setNpcAlternatives([]);
        setCurrentAltIndex(0);

        setRegenerating(true);
        setChatSending(true);
        try {
            const reply = await stage().generateConversionResponse(
                heroName,
                selectedArchetype?.id || null,
                newText,
                updatedMessages
            );
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
            }
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
            if (prev.length === 0) return [lastMsg];
            return prev;
        });

        // Find last player message text for re-send
        const lastPlayerMsg = [...chatMessages].reverse().find(m => m.sender === pcName);
        const trimmed = chatMessages.slice(0, -1);
        setChatMessages(trimmed);

        setRegenerating(true);
        setChatSending(true);
        try {
            const reply = await stage().generateConversionResponse(
                heroName,
                selectedArchetype?.id || null,
                lastPlayerMsg?.text || '',
                trimmed
            );
            if (reply) {
                setChatMessages(prev => [...prev, reply]);
                setNpcAlternatives(prev => {
                    const newAlts = [...prev, reply];
                    setCurrentAltIndex(newAlts.length - 1);
                    return newAlts;
                });
            }
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

        const alt = npcAlternatives[newIdx];
        setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = alt;
            return updated;
        });
    };

    const handleFinishConversion = async () => {
        setIsConverting(true);
        setPhase('converting');

        // Freeform: ask LLM to determine the result
        const heroTraits = hero ? [...hero.traits] : [];
        const result = await stage().generateConversionResult(heroName, chatMessages);
        if (result) {
            const success = stage().convertCaptiveWithCustom(
                heroName,
                result.description,
                result.traits
            );
            if (success) {
                setConversionResult({
                    description: result.description,
                    traits: result.traits,
                    originalTraits: heroTraits,
                    archetypeName: result.title,
                    archetypeColor: result.color,
                });
                setEditedDescription(result.description);
                // Save scene summary
                if (chatMessages.length > 0) {
                    const summary = await stage().generateSceneSummary(heroName, chatMessages);
                    if (summary) {
                        stage().updateCharacterHistory(heroName, summary);
                    }
                }
            }
        }
        setPhase('complete');
        setIsConverting(false);
    };

    // ═══════════════════════════════════════
    // PHASE: Choose conversion mode
    // ═══════════════════════════════════════
    if (phase === 'choose_mode') {
        return (
            <div className="conversion-screen">
                <div className="conversion-header">
                    <button
                        className="back-button"
                        onClick={() => setScreenType(ScreenType.CAPTIVES)}
                    >
                        &lt; Back
                    </button>
                    <h2>
                        <GameIcon icon="sparkle" size={16} className="icon-gold" /> Final Conversion
                    </h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="conversion-intro">
                    <div className="conversion-portrait">
                        <img src={charAvatar} alt={heroName} />
                        <div className="conversion-portrait-glow" />
                    </div>
                    <h3>{heroName}</h3>
                    <p className="conversion-intro-text">
                        <em>{heroName}'s will is completely broken. Their mind is a blank canvas, ready to be reshaped.</em>
                    </p>
                    <p className="conversion-intro-subtext">
                        Choose how to perform the final conversion:
                    </p>
                </div>

                <div className="conversion-mode-cards">
                    <button
                        className="conversion-mode-card mode-predefined"
                        onClick={() => handleChooseMode('predefined')}
                    >
                        <div className="mode-card-icon">
                            <GameIcon icon="scroll" size={24} />
                        </div>
                        <div className="mode-card-body">
                            <span className="mode-card-title">Choose Archetype</span>
                            <span className="mode-card-desc">
                                Select a predefined personality template. Quick and reliable — browse
                                from obedient servants to dark thralls.
                            </span>
                        </div>
                    </button>
                    <button
                        className="conversion-mode-card mode-freeform"
                        onClick={() => handleChooseMode('freeform')}
                    >
                        <div className="mode-card-icon">
                            <GameIcon icon="message-circle" size={24} />
                        </div>
                        <div className="mode-card-body">
                            <span className="mode-card-title">Shape Through Conversation</span>
                            <span className="mode-card-desc">
                                Speak with the captive during the final session. Their new personality
                                emerges from how you guide the conversation.
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // PHASE: Pick archetype
    // ═══════════════════════════════════════
    if (phase === 'pick_archetype') {
        // Group archetypes by category
        const categories = Object.entries(CATEGORY_META);
        const grouped = categories.map(([key, meta]) => ({
            key,
            ...meta,
            archetypes: CONVERSION_ARCHETYPES.filter(a => a.category === key),
        })).filter(g => g.archetypes.length > 0);

        return (
            <div className="conversion-screen">
                <div className="conversion-header">
                    <button className="back-button" onClick={() => setPhase('choose_mode')}>
                        &lt; Back
                    </button>
                    <h2>
                        <GameIcon icon="scroll" size={16} /> Choose Archetype
                    </h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="archetype-layout">
                    {/* Left: archetype list */}
                    <div className="archetype-list">
                        {grouped.map(group => (
                            <div key={group.key} className="archetype-group">
                                <div className="archetype-group-header" style={{ color: group.color }}>
                                    <GameIcon icon={group.icon} size={12} /> {group.label}
                                </div>
                                {group.archetypes.map(arch => (
                                    <button
                                        key={arch.id}
                                        className={`archetype-row ${previewArchetype?.id === arch.id ? 'previewing' : ''}`}
                                        onClick={() => setPreviewArchetype(arch)}
                                        onDoubleClick={() => handleSelectArchetype(arch)}
                                    >
                                        <span className="archetype-row-icon" style={{ color: arch.color }}>
                                            <GameIcon icon={arch.icon} size={16} />
                                        </span>
                                        <div className="archetype-row-info">
                                            <span className="archetype-row-name" style={{ color: arch.color }}>
                                                {arch.name}
                                            </span>
                                            <span className="archetype-row-desc">{arch.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Right: preview panel */}
                    <div className="archetype-preview">
                        {previewArchetype ? (
                            <>
                                <div className="archetype-preview-icon" style={{ color: previewArchetype.color }}>
                                    <GameIcon icon={previewArchetype.icon} size={32} />
                                </div>
                                <h3
                                    className="archetype-preview-name"
                                    style={{ color: previewArchetype.color }}
                                >
                                    {previewArchetype.name}
                                </h3>
                                <span className="archetype-preview-category" style={{ color: CATEGORY_META[previewArchetype.category]?.color }}>
                                    <GameIcon icon={CATEGORY_META[previewArchetype.category]?.icon || 'circle'} size={10} />{' '}
                                    {CATEGORY_META[previewArchetype.category]?.label}
                                </span>
                                <p className="archetype-preview-desc">{previewArchetype.description}</p>
                                <div className="archetype-preview-section">
                                    <h4>New Personality</h4>
                                    <p className="archetype-preview-personality">
                                        {previewArchetype.personalityRewrite}
                                    </p>
                                </div>
                                <div className="archetype-preview-section">
                                    <h4>Granted Traits</h4>
                                    <div className="archetype-preview-traits">
                                        {previewArchetype.grantedTraits.map((t, i) => (
                                            <span key={i} className="archetype-trait-chip">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="archetype-select-btn"
                                    style={{
                                        backgroundColor: previewArchetype.color,
                                        borderColor: previewArchetype.color,
                                    }}
                                    onClick={() => handleSelectArchetype(previewArchetype)}
                                >
                                    <GameIcon icon="sparkle" size={12} /> Convert {heroName} as{' '}
                                    {previewArchetype.name}
                                </button>
                            </>
                        ) : (
                            <div className="archetype-preview-empty">
                                <GameIcon icon="scroll" size={24} className="icon-muted" />
                                <p>Select an archetype to preview</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirmation overlay */}
                {confirmArchetype && (
                    <div className="conversion-confirm-overlay">
                        <div className="conversion-confirm-dialog" style={{ borderColor: `${confirmArchetype.color}66` }}>
                            <div className="conversion-confirm-icon" style={{ color: confirmArchetype.color }}>
                                <GameIcon icon={confirmArchetype.icon} size={28} />
                            </div>
                            <h3 style={{ color: confirmArchetype.color }}>{confirmArchetype.name}</h3>
                            <p>
                                Convert <strong>{heroName}</strong> as <strong style={{ color: confirmArchetype.color }}>{confirmArchetype.name}</strong>?
                            </p>
                            <p className="conversion-confirm-note">
                                A unique personality will be generated based on their history and the archetype.
                            </p>
                            <div className="confirmation-actions">
                                <button
                                    className="confirm-button cancel"
                                    onClick={() => setConfirmArchetype(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="confirm-button confirm-convert"
                                    style={{ backgroundColor: `${confirmArchetype.color}30`, borderColor: confirmArchetype.color, color: confirmArchetype.color }}
                                    onClick={handleArchetypeConfirm}
                                >
                                    <GameIcon icon="sparkle" size={12} /> Confirm Conversion
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════
    // PHASE: Final conversion session (chat)
    // ═══════════════════════════════════════
    if (phase === 'final_session') {
        const canFinish = chatMessages.length >= 2; // Need at least 1 exchange

        return (
            <div
                className="conversion-screen conversion-chat-mode"
                style={{ '--char-color': stage().getCharacterData(heroName)?.color || '#c8aa6e' } as React.CSSProperties}
            >
                {/* Minimal top controls */}
                <div className="conversion-chat-controls">
                    <button
                        className="conversion-chat-back"
                        onClick={() => {
                            if (chatMessages.length === 0) {
                                setPhase(chatMode === 'freeform' ? 'choose_mode' : 'pick_archetype');
                            }
                        }}
                        disabled={chatMessages.length > 0}
                        title={chatMessages.length > 0 ? 'Cannot go back during conversation' : 'Go back'}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <div className="conversion-chat-controls-right">
                        <button
                            className={`nsfw-toggle-btn ${stage().currentState.nsfwMode ? 'nsfw-active' : ''}`}
                            onClick={() => {
                                stage().currentState.nsfwMode = !stage().currentState.nsfwMode;
                            }}
                            title={stage().currentState.nsfwMode ? 'NSFW mode ON' : 'NSFW mode OFF'}
                        >
                            <Flame size={12} />
                        </button>
                        {canFinish && (
                            <button className="conversion-finish-btn" onClick={handleFinishConversion}>
                                <GameIcon icon="sparkle" size={10} /> Complete
                            </button>
                        )}
                    </div>
                </div>

                {/* Focus portrait — the captive, large and centered */}
                <div className="conversion-focus-portrait">
                    <div className="conversion-focus-ring" />
                    <div className="conversion-focus-ring conversion-focus-ring-outer" />
                    <img src={charAvatar} alt={heroName} />
                </div>
                <div className="conversion-focus-identity">
                    <span className="conversion-focus-name">{heroName}</span>
                    {selectedArchetype ? (
                        <span className="conversion-focus-path" style={{ color: selectedArchetype.color }}>
                            <GameIcon icon={selectedArchetype.icon} size={9} /> {selectedArchetype.name}
                        </span>
                    ) : (
                        <span className="conversion-focus-path conversion-focus-freeform">
                            <GameIcon icon="message-circle" size={9} /> Freeform
                        </span>
                    )}
                </div>

                {/* Atmospheric flavor line */}
                <p className="conversion-flavor">
                    <em>Their mind is an open canvas. Every word you speak reshapes what remains.</em>
                </p>

                {/* Chat messages */}
                <div className="conversion-chat-scroll">
                    {chatMessages.length === 0 && !chatSending && (
                        <div className="conversion-chat-empty">
                            <span>Begin shaping {heroName}...</span>
                        </div>
                    )}

                    {chatMessages.map((msg, idx) => {
                        const isPlayer = msg.sender === pcName;
                        const msgAvatar = isPlayer ? pcAvatar : charAvatar;
                        const isLatestNpc = !isPlayer && idx === chatMessages.length - 1;
                        const isEditing = editingMsgIndex === idx;
                        const isLastNpcMsg = !isPlayer && idx === chatMessages.length - 1;
                        const canEdit = !chatSending && !regenerating && editingMsgIndex === null;
                        const canRegen = isLastNpcMsg && !chatSending && !regenerating && editingMsgIndex === null;
                        const hasAlts = isLastNpcMsg && npcAlternatives.length > 1;

                        return (
                            <div
                                key={`msg-${idx}`}
                                className={`conversion-chat-msg ${isPlayer ? 'msg-player' : 'msg-captive'} ${isEditing ? 'msg-editing' : ''}`}
                            >
                                <img className="conversion-chat-msg-avatar" src={msgAvatar} alt={msg.sender} />
                                <div className="conversion-chat-msg-body">
                                    <span className="conversion-chat-msg-name">{msg.sender}</span>
                                    <div
                                        key={isEditing ? `edit-${idx}` : `display-${idx}`}
                                        className={`conversion-chat-msg-text ${isEditing ? 'msg-text-editing' : ''}`}
                                        contentEditable={isEditing}
                                        suppressContentEditableWarning
                                        ref={el => {
                                            if (isEditing && el) {
                                                if (el.innerText !== editText) {
                                                    el.innerText = editText;
                                                }
                                                if (document.activeElement !== el) {
                                                    el.focus();
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
                                                : <FormattedText text={msg.text} />
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className="conversion-msg-edit-buttons">
                                            <button className="conversion-edit-btn edit-save" onClick={handleSaveEdit} title={isPlayer ? 'Save & regenerate' : 'Save edit'}>
                                                <Check size={11} /> Save
                                            </button>
                                            <button className="conversion-edit-btn edit-cancel" onClick={handleCancelEdit} title="Cancel">
                                                <X size={11} /> Cancel
                                            </button>
                                        </div>
                                    )}
                                    {/* Edit / Regenerate / Swipe controls */}
                                    {!isEditing && canEdit && (
                                        <div className="conversion-msg-actions">
                                            <button className="conversion-msg-action-btn" onClick={() => handleStartEdit(idx)} title="Edit message">
                                                <Pencil size={10} />
                                            </button>
                                            {canRegen && (
                                                <button className="conversion-msg-action-btn" onClick={handleRegenerate} title="Regenerate response">
                                                    <RotateCcw size={10} />
                                                </button>
                                            )}
                                            {!isPlayer && msg._debugContext && (
                                                <button
                                                    className="conversion-msg-action-btn debug-context-btn"
                                                    onClick={() => setDebugContextText(msg._debugContext || null)}
                                                    title="View generation context"
                                                >
                                                    <FileText size={10} />
                                                </button>
                                            )}
                                            {hasAlts && (
                                                <div className="conversion-msg-swipe">
                                                    <button
                                                        className="conversion-msg-action-btn"
                                                        onClick={() => handleSwipeAlt(-1)}
                                                        disabled={currentAltIndex <= 0}
                                                        title="Previous response"
                                                    >
                                                        <ChevronLeft size={10} />
                                                    </button>
                                                    <span className="conversion-msg-swipe-counter">
                                                        {currentAltIndex + 1}/{npcAlternatives.length}
                                                    </span>
                                                    <button
                                                        className="conversion-msg-action-btn"
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

                    {chatSending && <TypingIndicator name={heroName} avatar={charAvatar} />}
                    <div ref={chatEndRef} />
                </div>

                {/* Debug context viewer overlay */}
                {debugContextText && (
                    <div className="conversion-debug-overlay" onClick={() => setDebugContextText(null)}>
                        <div className="conversion-debug-panel" onClick={e => e.stopPropagation()}>
                            <div className="conversion-debug-header">
                                <span>Generation Context</span>
                                <button onClick={() => setDebugContextText(null)}><X size={14} /></button>
                            </div>
                            <pre className="conversion-debug-content">{debugContextText}</pre>
                        </div>
                    </div>
                )}

                {/* Input bar */}
                <div className="conversion-chat-input-bar">
                    <img className="conversion-chat-input-avatar" src={pcAvatar} alt={pcName} />
                    <div className="conversion-chat-input-wrapper">
                        <textarea
                            ref={chatInputRef}
                            className="conversion-chat-input"
                            placeholder={selectedArchetype
                                ? `Shape ${heroName} into the ${selectedArchetype.name}...`
                                : `Command ${heroName}'s transformation...`
                            }
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleChatKeyDown}
                            disabled={chatSending}
                            rows={1}
                        />
                    </div>
                    <button
                        className="conversion-chat-send"
                        onClick={handleChatSend}
                        disabled={chatSending || !chatInput.trim()}
                    >
                        {chatSending ? (
                            <GameIcon icon="orbit" size={14} className="spin" />
                        ) : (
                            <GameIcon icon="sparkle" size={14} />
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // PHASE: Converting (loading)
    // ═══════════════════════════════════════
    if (phase === 'converting') {
        return (
            <div className="conversion-screen">
                <div className="conversion-loading">
                    <div className="conversion-portrait">
                        <img src={charAvatar} alt={heroName} />
                        <div className="conversion-portrait-glow converting-glow" />
                    </div>
                    <h3>Converting {heroName}...</h3>
                    <p className="conversion-loading-text">
                        <em>The enchantment takes hold. Their old self dissolves like mist at dawn...</em>
                    </p>
                    <div className="conversion-spinner">
                        <GameIcon icon="orbit" size={24} className="spin icon-gold" />
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // PHASE: Complete
    // ═══════════════════════════════════════
    if (phase === 'complete' && conversionResult) {
        return (
            <div className="conversion-screen">
                <div className="conversion-header">
                    <div className="header-spacer"></div>
                    <h2>
                        <GameIcon icon="sparkle" size={16} className="icon-gold" /> Conversion Complete
                    </h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="conversion-complete">
                    <div className="conversion-portrait">
                        <img src={charAvatar} alt={heroName} />
                        <div className="conversion-portrait-glow complete-glow" />
                    </div>
                    <h3>{heroName}</h3>
                    {conversionResult.archetypeName && (
                        <span
                            className="conversion-archetype-badge"
                            style={{ borderColor: conversionResult.archetypeColor, color: conversionResult.archetypeColor }}
                        >
                            {conversionResult.archetypeName}
                        </span>
                    )}

                    {/* ── Personality section ── */}
                    <div className="conversion-result-section">
                        <div className="conversion-result-header">
                            <h4>New Personality</h4>
                            {!editingDescription && !isGenerating && (
                                <div className="conversion-result-actions">
                                    <button
                                        className="conversion-action-btn"
                                        onClick={() => { setEditingDescription(true); setEditedDescription(conversionResult.description); }}
                                        title="Edit description"
                                    >
                                        <Pencil size={11} />
                                    </button>
                                    {conversionResult.archetypeId && (
                                        <button
                                            className="conversion-action-btn"
                                            onClick={handleRegenerateDescription}
                                            title="Regenerate description"
                                        >
                                            <RotateCcw size={11} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {isGenerating ? (
                            <div className="conversion-result-generating">
                                <div className="conversion-generating-shimmer" />
                                <span className="conversion-generating-text">
                                    <GameIcon icon="orbit" size={12} className="spin icon-gold" />{' '}
                                    Weaving new personality...
                                </span>
                            </div>
                        ) : editingDescription ? (
                            <div className="conversion-result-edit">
                                <textarea
                                    className="conversion-edit-textarea"
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    rows={6}
                                />
                                <div className="conversion-edit-actions">
                                    <button className="conversion-action-btn action-save" onClick={handleSaveDescription}>
                                        <Check size={12} /> Save
                                    </button>
                                    <button className="conversion-action-btn action-cancel" onClick={handleCancelDescriptionEdit}>
                                        <X size={12} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="conversion-result-description">
                                {conversionResult.description}
                            </p>
                        )}
                    </div>

                    {/* ── Traits section ── */}
                    <div className="conversion-result-section">
                        <h4>Traits</h4>
                        <div className="conversion-result-traits-split">
                            {/* Original traits */}
                            {conversionResult.originalTraits.length > 0 && (
                                <div className="conversion-trait-group">
                                    <span className="conversion-trait-label">Original</span>
                                    <div className="conversion-trait-chips">
                                        {conversionResult.originalTraits.map((t, i) => (
                                            <span key={`orig-${i}`} className="conversion-trait-chip trait-original">
                                                <span className="trait-decorator">◆</span> {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Archetype-granted traits */}
                            {conversionResult.traits.length > 0 && (
                                <div className="conversion-trait-group">
                                    <span className="conversion-trait-label">
                                        {conversionResult.archetypeName ? `Granted by ${conversionResult.archetypeName}` : 'New Traits'}
                                    </span>
                                    <div className="conversion-trait-chips">
                                        {conversionResult.traits.map((t, i) => (
                                            <span key={`new-${i}`} className="conversion-trait-chip trait-granted">
                                                <span className="trait-decorator">★</span> {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="conversion-result-subtext">
                        <em>{heroName} has been added to your servants.</em>
                    </p>
                    <button className="archetype-select-btn" onClick={onComplete}>
                        <GameIcon icon="check" size={12} /> Continue
                    </button>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="conversion-screen">
            <div className="conversion-loading">
                <p>Something went wrong.</p>
                <button className="back-button" onClick={onComplete}>
                    Return
                </button>
            </div>
        </div>
    );
};
