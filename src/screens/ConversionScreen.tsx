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

import DungeonBg from '../assets/Images/Rooms/dungeon.jpg';

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

    const handleCancelEdit = () => {
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
                className="conversion-screen conversion-chat-mode skit-screen skit-active"
                style={{ '--char-color': stage().getCharacterData(heroName)?.color || '#c8aa6e' } as React.CSSProperties}
            >
                <div className="skit-background" style={{ backgroundImage: `url(${DungeonBg})` }} />
                <div className="skit-overlay" />

                {/* Header */}
                <div className="skit-header">
                    <div className="skit-header-left">
                        <span className="skit-location-badge">
                            <GameIcon icon="sparkle" size={10} className="icon-gold" /> Final Conversion
                        </span>
                    </div>
                    <div className="skit-header-center">
                        <img className="skit-header-avatar" src={charAvatar} alt={heroName} />
                        <span className="skit-header-name">{heroName}</span>
                    </div>
                    <div className="skit-header-right">
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
                            <button className="skit-end-btn" onClick={handleFinishConversion}>
                                <GameIcon icon="sparkle" size={12} className="icon-gold" /> Complete Conversion ▸
                            </button>
                        )}
                    </div>
                </div>

                {/* Conversion progress indicator */}
                <div className="conditioning-progress-header">
                    <div className="conditioning-progress-info">
                        <span className="conditioning-tier-badge" style={{ color: '#fbbf24' }}>
                            CONVERSION
                        </span>
                        <span className="conditioning-bw-value">100%</span>
                        {selectedArchetype && (
                            <span
                                className="conditioning-strategy-badge"
                                style={{ color: selectedArchetype.color }}
                            >
                                <GameIcon icon={selectedArchetype.icon} size={10} />{' '}
                                {selectedArchetype.name}
                            </span>
                        )}
                        {!selectedArchetype && (
                            <span className="conditioning-strategy-badge" style={{ color: '#38bdf8' }}>
                                <GameIcon icon="message-circle" size={10} /> Freeform
                            </span>
                        )}
                    </div>
                    <div className="conditioning-progress-track">
                        <div
                            className="conditioning-progress-fill conversion-fill"
                            style={{ width: '100%', backgroundColor: '#fbbf24' }}
                        />
                    </div>
                </div>

                {/* Chat messages */}
                <div className="skit-conversation">
                    {/* Intro narrative */}
                    <div className="event-chat-context">
                        <p className="event-text-line">
                            <em>
                                You enter the conditioning chamber for the final time. {heroName} kneels
                                before you, eyes vacant, will completely shattered. The enchanted
                                shackles barely glow — there is nothing left to restrain.
                            </em>
                        </p>
                        <p className="event-text-line">
                            <em>The spiral incense swirls golden in the dim light. It is time to reshape what remains.</em>
                        </p>
                        {selectedArchetype && (
                            <p className="event-text-line">
                                <em>
                                    You have chosen the path of the{' '}
                                    <span style={{ color: selectedArchetype.color, fontWeight: 'bold' }}>
                                        {selectedArchetype.name}
                                    </span>
                                    .
                                </em>
                            </p>
                        )}
                    </div>

                    {chatMessages.length === 0 && !chatSending && (
                        <div className="skit-empty-hint">
                            <div className="skit-empty-icon">
                                <GameIcon icon="sparkle" size={24} className="icon-gold" />
                            </div>
                            <p>Begin the final conversion of {heroName}...</p>
                        </div>
                    )}

                    {chatMessages.map((msg, idx) => {
                        const isPlayer = msg.sender === pcName;
                        const msgAvatar = isPlayer ? pcAvatar : charAvatar;
                        const isLatestNpc = !isPlayer && idx === chatMessages.length - 1;

                        return (
                            <div
                                key={`msg-${idx}`}
                                className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'}`}
                            >
                                <img className="skit-msg-avatar" src={msgAvatar} alt={msg.sender} />
                                <div className="skit-msg-body">
                                    <span className="skit-msg-name">{msg.sender}</span>
                                    <div className="skit-msg-text">
                                        {isLatestNpc ? (
                                            <TypewriterText text={msg.text} speed={40} />
                                        ) : (
                                            <FormattedText text={msg.text} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {chatSending && <TypingIndicator name={heroName} avatar={charAvatar} />}
                    <div ref={chatEndRef} />
                </div>

                {/* Input bar */}
                <div className="skit-input-bar">
                    <img className="skit-input-avatar" src={pcAvatar} alt={pcName} />
                    <div className="skit-input-wrapper">
                        <textarea
                            ref={chatInputRef}
                            className="skit-input"
                            placeholder={`Shape ${heroName}'s new identity...`}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleChatKeyDown}
                            disabled={chatSending}
                            rows={1}
                        />
                    </div>
                    <button
                        className="skit-send-btn"
                        onClick={handleChatSend}
                        disabled={chatSending || !chatInput.trim()}
                    >
                        {chatSending ? '...' : '▶'}
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
                                    <button className="conversion-action-btn action-cancel" onClick={handleCancelEdit}>
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
