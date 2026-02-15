import React, { FC, useState, useRef, useEffect } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant, Location } from '../Stage';
import { FormattedText, TypewriterText, TypingIndicator } from './SkitText';

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

const SKIT_LOCATIONS: Location[] = ['Manor', 'Town', 'Woods', 'Ruins', 'Circus', 'Dungeon'];

interface SkitScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const SkitScreen: FC<SkitScreenProps> = ({ stage, setScreenType }) => {
    const s = stage();
    const servants = Object.values(s.currentState.servants);
    const activeSkit = s.currentState.activeSkit;
    const [selectedLocation, setSelectedLocation] = useState<Location>(s.currentState.location);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const skitMessages = s.skitMessages;

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [skitMessages.length]);

    // Focus input on mount
    useEffect(() => {
        if (activeSkit) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [activeSkit]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || isSending) return;
        setInputText('');
        setIsSending(true);
        try {
            await s.sendSkitMessage(text);
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

    const handleStartSkit = (servant: Servant) => {
        s.startSkit(servant.name, selectedLocation);
    };

    const handleEndSkit = () => {
        s.endSkit();
        setScreenType(ScreenType.MENU);
    };

    // ============================================================
    // ACTIVE CONVERSATION VIEW
    // ============================================================
    if (activeSkit) {
        const charData = s.getCharacterData(activeSkit.characterName);
        const bg = LOCATION_BACKGROUNDS[activeSkit.location] || ManorExteriorBg;
        const charAvatar = s.getCharacterAvatar(activeSkit.characterName);
        const pcAvatar = s.currentState.playerCharacter.avatar;
        const pcName = s.currentState.playerCharacter.name;

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
    }

    // ============================================================
    // SERVANT SELECTION VIEW
    // ============================================================
    return (
        <div className="skit-screen skit-selection">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Conversations</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="skit-selection-content">
                {/* Location picker */}
                <div className="skit-location-picker">
                    <span className="skit-picker-label">Location</span>
                    <div className="skit-location-options">
                        {SKIT_LOCATIONS.map(loc => (
                            <button
                                key={loc}
                                className={`skit-loc-btn ${selectedLocation === loc ? 'active' : ''}`}
                                onClick={() => setSelectedLocation(loc)}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location preview */}
                <div className="skit-location-preview">
                    <img
                        src={LOCATION_BACKGROUNDS[selectedLocation] || ManorExteriorBg}
                        alt={selectedLocation}
                    />
                    <div className="skit-preview-overlay" />
                    <span className="skit-preview-label">{selectedLocation}</span>
                </div>

                {/* Servant grid */}
                <div className="skit-companion-label">Choose a Companion</div>
                <div className="skit-companion-grid">
                    {servants.length === 0 ? (
                        <div className="skit-empty-msg">No servants available yet...</div>
                    ) : (
                        servants.map(servant => (
                            <button
                                key={servant.name}
                                className="skit-companion-card"
                                style={{ '--char-color': servant.color } as React.CSSProperties}
                                onClick={() => handleStartSkit(servant)}
                            >
                                <img
                                    className="skit-companion-avatar"
                                    src={servant.avatar}
                                    alt={servant.name}
                                />
                                <div className="skit-companion-info">
                                    <span className="skit-companion-name">{servant.name}</span>
                                    <span className="skit-companion-role">{servant.formerClass}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
