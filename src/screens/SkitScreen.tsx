import React, { FC, useState, useRef, useEffect } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant, Location } from '../Stage';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSkit?.messages?.length]);

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
                    {activeSkit.messages.length === 0 && (
                        <div className="skit-empty-hint">
                            <div className="skit-empty-icon">💬</div>
                            <p>Type in the chat below to begin speaking with {activeSkit.characterName}.</p>
                        </div>
                    )}
                    {activeSkit.messages.map((msg, i) => {
                        const isPlayer = msg.sender === pcName;
                        const avatar = isPlayer ? pcAvatar : charAvatar;
                        return (
                            <div
                                key={i}
                                className={`skit-message ${isPlayer ? 'skit-msg-player' : 'skit-msg-char'}`}
                            >
                                <img className="skit-msg-avatar" src={avatar} alt={msg.sender} />
                                <div className="skit-msg-body">
                                    <span className="skit-msg-name">{msg.sender}</span>
                                    <div className="skit-msg-text">{msg.text}</div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom hint */}
                <div className="skit-bottom-bar">
                    <span className="skit-chat-hint">⬇ Send a message in the chat below ⬇</span>
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
