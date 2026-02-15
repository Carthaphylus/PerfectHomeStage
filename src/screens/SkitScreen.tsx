import React, { FC, useState, useRef, useEffect } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, SkitMessage } from '../Stage';
import { FormattedText, TypewriterText, TypingIndicator } from './SkitText';
import { SkitVNView } from './SkitVNView';

type SkitViewMode = 'chat' | 'vn';

// Background images for skit locations
import ManorBg from '../assets/Images/Skits/Manor - Decorated.png';
import ManorExteriorBg from '../assets/Images/Skits/Manor - Exterior.png';
import TownBg from '../assets/Images/Skits/Town.webp';
import WoodsBg from '../assets/Images/Skits/Woods.webp';
import RuinsBg from '../assets/Images/Skits/Deep Ruins.png';
import CircusBg from '../assets/Images/Skits/Circus.webp';
import DungeonBg from '../assets/Images/Rooms/dungeon.jpg';

const LOCATION_BACKGROUNDS: Record<string, string> = {
    'Manor': ManorBg,
    'Town': TownBg,
    'Woods': WoodsBg,
    'Ruins': RuinsBg,
    'Circus': CircusBg,
    'Dungeon': DungeonBg,
    'Unknown': ManorExteriorBg,
};

interface SkitScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

/**
 * SkitScreen — Active conversation view only.
 * Mounts fresh for every new skit via key={skitId} in BaseScreen.
 * If no active skit exists, immediately redirects to SERVANTS.
 */
export const SkitScreen: FC<SkitScreenProps> = ({ stage, setScreenType }) => {
    const s = stage();
    const activeSkit = s.getActiveSkit();

    // ── Guard: redirect if no active skit ──
    useEffect(() => {
        if (!activeSkit) {
            console.warn('[SkitScreen] No active skit — redirecting');
            setScreenType(ScreenType.SERVANTS);
        }
    }, []);

    // ── Local state ──
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [viewMode, setViewMode] = useState<SkitViewMode>('chat');
    const [messageCount, setMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Kick a poll loop that syncs message count from stage
    useEffect(() => {
        const interval = setInterval(() => {
            const msgs = s.getSkitMessages();
            if (msgs.length !== messageCount) {
                setMessageCount(msgs.length);
            }
        }, 200);
        return () => clearInterval(interval);
    }, [messageCount, s]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageCount]);

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // Bail early if guard hasn't redirected yet
    if (!activeSkit) return null;

    // ── Derived values (stable for this skit's lifetime) ──
    const skitMessages = s.getSkitMessages();
    const charData = s.getCharacterData(activeSkit.characterName);
    const bg = LOCATION_BACKGROUNDS[activeSkit.location] || ManorExteriorBg;
    const charAvatar = s.getCharacterAvatar(activeSkit.characterName);
    const pcAvatar = s.currentState.playerCharacter.avatar;
    const pcName = s.currentState.playerCharacter.name;

    // ── Handlers ──
    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || isSending) return;
        setInputText('');
        setIsSending(true);
        try {
            await s.sendSkitMessage(text);
            // Force message count sync after send
            setMessageCount(s.getSkitMessages().length);
        } finally {
            setIsSending(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEndSkit = () => {
        s.endSkit();
        setScreenType(ScreenType.MENU);
    };

    const handleVNSend = async (text: string) => {
        setIsSending(true);
        try {
            await s.sendSkitMessage(text);
            setMessageCount(s.getSkitMessages().length);
        } finally {
            setIsSending(false);
        }
    };

    // ═══════════════════════════════════════════
    // VN MODE
    // ═══════════════════════════════════════════
    if (viewMode === 'vn') {
        return (
            <div
                className="skit-screen skit-active skit-vn-wrapper"
                style={{ '--char-color': charData?.color || '#c8aa6e' } as React.CSSProperties}
            >
                <button
                    className="vn-view-toggle"
                    onClick={() => setViewMode('chat')}
                    title="Switch to Chat view"
                >
                    💬
                </button>
                <SkitVNView
                    stage={stage}
                    activeSkit={activeSkit}
                    bgImage={bg}
                    charAvatar={charAvatar}
                    pcAvatar={pcAvatar}
                    pcName={pcName}
                    skitMessages={skitMessages}
                    isSending={isSending}
                    onSend={handleVNSend}
                    onEnd={handleEndSkit}
                />
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // CHAT MODE
    // ═══════════════════════════════════════════
    return (
        <div
            className="skit-screen skit-active"
            style={{ '--char-color': charData?.color || '#c8aa6e' } as React.CSSProperties}
        >
            {/* Full background */}
            <div className="skit-background" style={{ backgroundImage: `url(${bg})` }} />
            <div className="skit-overlay" />

            {/* Top bar */}
            <div className="skit-header">
                <div className="skit-header-left">
                    <span className="skit-location-badge">{activeSkit.location}</span>
                </div>
                <div className="skit-header-center">
                    <img className="skit-header-avatar" src={charAvatar} alt={activeSkit.characterName} />
                    <span className="skit-header-name">{activeSkit.characterName}</span>
                </div>
                <div className="skit-header-right">
                    <button
                        className="skit-view-toggle"
                        onClick={() => setViewMode('vn')}
                        title="Switch to Visual Novel view"
                    >
                        📖
                    </button>
                    <button className="skit-end-btn" onClick={handleEndSkit}>End</button>
                </div>
            </div>

            {/* Messages area */}
            <div className="skit-conversation">
                {skitMessages.length === 0 && !isSending && (
                    <div className="skit-empty-hint">
                        <div className="skit-empty-icon">💬</div>
                        <p>Type in the chat below to begin speaking with {activeSkit.characterName}.</p>
                    </div>
                )}
                {skitMessages.map((msg, i) => {
                    const isPlayer = msg.sender === pcName;
                    const avatar = isPlayer ? pcAvatar : charAvatar;
                    const isLatestNpc = !isPlayer && i === skitMessages.length - 1;
                    return (
                        <div
                            key={i}
                            className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'}`}
                        >
                            <img className="skit-msg-avatar" src={avatar} alt={msg.sender} />
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
                {isSending && (
                    <TypingIndicator
                        name={activeSkit.characterName}
                        avatar={charAvatar}
                    />
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="skit-input-bar">
                <img className="skit-input-avatar" src={pcAvatar} alt={pcName} />
                <div className="skit-input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="skit-input"
                        placeholder={`Speak as ${pcName}...`}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        rows={1}
                    />
                </div>
                <button
                    className={`skit-send-btn ${isSending ? 'sending' : ''}`}
                    onClick={handleSend}
                    disabled={isSending || !inputText.trim()}
                >
                    {isSending ? '...' : '▶'}
                </button>
            </div>
        </div>
    );
};
