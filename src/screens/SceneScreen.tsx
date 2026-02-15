import React, { FC, useState, useRef, useEffect } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, SceneData, SceneMessage } from '../Stage';
import { FormattedText, TypewriterText, TypingIndicator } from './SkitText';
import { SceneVNView } from './SceneVNView';

type ViewMode = 'chat' | 'vn';

// Background images for scene locations
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

interface SceneScreenProps {
    stage: () => Stage;
    scene: SceneData;                              // Owned by parent — immutable snapshot
    setScreenType: (type: ScreenType) => void;
    onEnd: () => void;                             // Called when user wants to leave
}

/**
 * SceneScreen — Active conversation view.
 * ALL message state is owned here in useState.
 * Stage class is only used as an API layer (sendSceneMessage).
 * This component never reads mutable fields from Stage for scene data.
 */
export const SceneScreen: FC<SceneScreenProps> = ({ stage, scene, setScreenType, onEnd }) => {
    // ── React-owned state (the single source of truth for messages) ──
    const [messages, setMessages] = useState<SceneMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Derived values from the scene snapshot (immutable for this mount) ──
    const s = stage();
    const primaryChar = scene.participants[0];
    const charData = s.getCharacterData(primaryChar);
    const bg = LOCATION_BACKGROUNDS[scene.location] || ManorExteriorBg;
    const charAvatar = s.getCharacterAvatar(primaryChar);
    const pcAvatar = s.currentState.playerCharacter.avatar;
    const pcName = s.currentState.playerCharacter.name;

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // ── Handlers ──
    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || isSending) return;
        setInputText('');

        // Immediately add player message to our React state
        const playerMsg: SceneMessage = { sender: pcName, text };
        setMessages(prev => [...prev, playerMsg]);

        setIsSending(true);
        try {
            // Call Stage API — returns the NPC reply (or null)
            const reply = await s.sendSceneMessage(text);
            if (reply) {
                // Add NPC reply to our React state
                setMessages(prev => [...prev, reply]);
            }
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

    const handleEnd = () => {
        s.endScene();
        onEnd();
    };

    const handleVNSend = async (text: string) => {
        const playerMsg: SceneMessage = { sender: pcName, text };
        setMessages(prev => [...prev, playerMsg]);

        setIsSending(true);
        try {
            const reply = await s.sendSceneMessage(text);
            if (reply) {
                setMessages(prev => [...prev, reply]);
            }
        } finally {
            setIsSending(false);
        }
    };

    // ═════════════════════════════════════════
    // VN MODE
    // ═════════════════════════════════════════
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
                <SceneVNView
                    stage={stage}
                    scene={scene}
                    bgImage={bg}
                    charAvatar={charAvatar}
                    pcAvatar={pcAvatar}
                    pcName={pcName}
                    messages={messages}
                    isSending={isSending}
                    onSend={handleVNSend}
                    onEnd={handleEnd}
                />
            </div>
        );
    }

    // ═════════════════════════════════════════
    // CHAT MODE
    // ═════════════════════════════════════════
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
                    <span className="skit-location-badge">{scene.location}</span>
                </div>
                <div className="skit-header-center">
                    <img className="skit-header-avatar" src={charAvatar} alt={primaryChar} />
                    <span className="skit-header-name">
                        {scene.participants.length > 1
                            ? scene.participants.join(' & ')
                            : primaryChar}
                    </span>
                </div>
                <div className="skit-header-right">
                    <button
                        className="skit-view-toggle"
                        onClick={() => setViewMode('vn')}
                        title="Switch to Visual Novel view"
                    >
                        📖
                    </button>
                    <button className="skit-end-btn" onClick={handleEnd}>End</button>
                </div>
            </div>

            {/* Messages area */}
            <div className="skit-conversation">
                {messages.length === 0 && !isSending && (
                    <div className="skit-empty-hint">
                        <div className="skit-empty-icon">💬</div>
                        <p>Type in the chat below to begin speaking with {primaryChar}.</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isPlayer = msg.sender === pcName;
                    const msgAvatar = isPlayer ? pcAvatar : s.getCharacterAvatar(msg.sender) || charAvatar;
                    const isLatestNpc = !isPlayer && i === messages.length - 1;
                    const msgCharData = !isPlayer ? s.getCharacterData(msg.sender) : null;
                    return (
                        <div
                            key={i}
                            className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'}`}
                            style={msgCharData ? { '--char-color': msgCharData.color } as React.CSSProperties : undefined}
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
                {isSending && (
                    <TypingIndicator
                        name={primaryChar}
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
