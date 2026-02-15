import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Stage, SkitMessage } from '../Stage';
import { FormattedText, TypewriterText } from './SkitText';

// ============================================================
// TEXT PAGINATION — split long text into pages
// ============================================================
const MAX_CHARS_PER_PAGE = 280;

function paginateText(text: string): string[] {
    if (text.length <= MAX_CHARS_PER_PAGE) return [text];

    const pages: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= MAX_CHARS_PER_PAGE) {
            pages.push(remaining);
            break;
        }
        // Find a good break point (sentence end, period, comma, or space)
        let breakAt = MAX_CHARS_PER_PAGE;
        // Try to break at sentence end first
        const sentenceEnd = remaining.lastIndexOf('. ', breakAt);
        if (sentenceEnd > MAX_CHARS_PER_PAGE * 0.4) {
            breakAt = sentenceEnd + 1;
        } else {
            // Fall back to last space
            const spaceAt = remaining.lastIndexOf(' ', breakAt);
            if (spaceAt > MAX_CHARS_PER_PAGE * 0.3) {
                breakAt = spaceAt;
            }
        }
        pages.push(remaining.slice(0, breakAt).trim());
        remaining = remaining.slice(breakAt).trim();
    }
    return pages;
}

// ============================================================
// VN VIEW COMPONENT
// ============================================================

interface SkitVNViewProps {
    stage: () => Stage;
    activeSkit: { characterName: string; location: string };
    bgImage: string;
    charAvatar: string;
    pcAvatar: string;
    pcName: string;
    skitMessages: SkitMessage[];
    isSending: boolean;
    onSend: (text: string) => void;
    onEnd: () => void;
}

export const SkitVNView: FC<SkitVNViewProps> = ({
    stage,
    activeSkit,
    bgImage,
    charAvatar,
    pcAvatar,
    pcName,
    skitMessages,
    isSending,
    onSend,
    onEnd,
}) => {
    const s = stage();
    const [inputText, setInputText] = useState('');
    const [isInputMode, setIsInputMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [typewriterDone, setTypewriterDone] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Get bg-removed images when available
    const genImages = s.chatState.generatedImages || {};
    const charBgRemoved = genImages[activeSkit.characterName]?.['bg_removed'];
    const pcBgRemoved = genImages[pcName]?.['bg_removed'];

    const charSprite = charBgRemoved || charAvatar;
    const pcSprite = pcBgRemoved || pcAvatar;

    // Determine which message to display (latest)
    const latestMsg = skitMessages.length > 0 ? skitMessages[skitMessages.length - 1] : null;
    const isLatestPlayer = latestMsg?.sender === pcName;

    // Paginate the latest message
    const pages = latestMsg ? paginateText(latestMsg.text) : [];
    const totalPages = pages.length;
    const isLastPage = currentPage >= totalPages - 1;
    const isNewNpcMessage = latestMsg && !isLatestPlayer;

    // Reset page when a new message arrives
    const prevMsgCountRef = useRef(skitMessages.length);
    useEffect(() => {
        if (skitMessages.length !== prevMsgCountRef.current) {
            prevMsgCountRef.current = skitMessages.length;
            setCurrentPage(0);
            setTypewriterDone(false);
            setIsInputMode(false);
        }
    }, [skitMessages.length]);

    // Focus input when entering input mode
    useEffect(() => {
        if (isInputMode) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isInputMode]);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(p => p + 1);
            setTypewriterDone(false);
        } else {
            // On last page, switch to input mode
            setIsInputMode(true);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(p => p - 1);
        }
    };

    const handleSend = () => {
        const text = inputText.trim();
        if (!text || isSending) return;
        setInputText('');
        setIsInputMode(false);
        onSend(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Click anywhere on VN to advance text
    const handleVNClick = useCallback(() => {
        if (isInputMode || isSending) return;
        if (!latestMsg) {
            // No messages yet — go to input
            setIsInputMode(true);
            return;
        }
        // If typewriter is still running, skip animation
        if (isNewNpcMessage && !typewriterDone) {
            setTypewriterDone(true);
            return;
        }
        handleNext();
    }, [isInputMode, isSending, latestMsg, isNewNpcMessage, typewriterDone, totalPages, currentPage]);

    // Active speaker name and color
    const activeSpeaker = latestMsg?.sender || '';
    const charData = s.getCharacterData(activeSkit.characterName);
    const isCharSpeaking = activeSpeaker === activeSkit.characterName;

    return (
        <div className="vn-view" onClick={handleVNClick}>
            {/* Full background */}
            <div className="vn-background" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="vn-bg-overlay" />

            {/* Top bar — minimal */}
            <div className="vn-top-bar" onClick={e => e.stopPropagation()}>
                <span className="vn-location">{activeSkit.location}</span>
                <button className="vn-end-btn" onClick={onEnd}>✕</button>
            </div>

            {/* Character sprites */}
            <div className="vn-sprites">
                {/* PC sprite — left side */}
                <div className={`vn-sprite vn-sprite-left ${!isCharSpeaking && latestMsg ? 'speaking' : 'dimmed'}`}>
                    <img src={pcSprite} alt={pcName} />
                </div>
                {/* NPC sprite — right side */}
                <div className={`vn-sprite vn-sprite-right ${isCharSpeaking ? 'speaking' : 'dimmed'}`}>
                    <img src={charSprite} alt={activeSkit.characterName} />
                </div>
            </div>

            {/* Text box */}
            <div className="vn-textbox" onClick={e => e.stopPropagation()}>
                {/* Typing indicator */}
                {isSending && (
                    <div className="vn-textbox-inner">
                        <div className="vn-speaker" style={{ color: charData?.color || '#c8aa6e' }}>
                            {activeSkit.characterName}
                        </div>
                        <div className="vn-text vn-typing-dots">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                        </div>
                    </div>
                )}

                {/* Input mode */}
                {!isSending && isInputMode && (
                    <div className="vn-textbox-inner vn-input-mode">
                        <div className="vn-speaker" style={{ color: '#c8aa6e' }}>
                            {pcName}
                        </div>
                        <textarea
                            ref={inputRef}
                            className="vn-input"
                            placeholder={`What does ${pcName} say or do...`}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={3}
                        />
                        <button
                            className="vn-send-btn"
                            onClick={handleSend}
                            disabled={!inputText.trim() || isSending}
                        >
                            ▶
                        </button>
                    </div>
                )}

                {/* Message display */}
                {!isSending && !isInputMode && latestMsg && (
                    <div className="vn-textbox-inner" onClick={handleVNClick}>
                        <div
                            className="vn-speaker"
                            style={{ color: isCharSpeaking ? (charData?.color || '#c8aa6e') : '#c8aa6e' }}
                        >
                            {activeSpeaker}
                        </div>
                        <div className="vn-text">
                            {isNewNpcMessage && currentPage === 0 && !typewriterDone ? (
                                <TypewriterText
                                    text={pages[0] || ''}
                                    speed={40}
                                    onComplete={() => setTypewriterDone(true)}
                                />
                            ) : (
                                <FormattedText text={pages[currentPage] || ''} />
                            )}
                        </div>
                        {/* Page indicator + nav */}
                        {totalPages > 1 && (
                            <div className="vn-page-nav">
                                <button
                                    className="vn-page-btn"
                                    onClick={e => { e.stopPropagation(); handlePrev(); }}
                                    disabled={currentPage === 0}
                                >
                                    ◀
                                </button>
                                <span className="vn-page-count">{currentPage + 1}/{totalPages}</span>
                                <button
                                    className="vn-page-btn"
                                    onClick={e => { e.stopPropagation(); handleNext(); }}
                                    disabled={isLastPage}
                                >
                                    ▶
                                </button>
                            </div>
                        )}
                        {/* "Click to continue" hint */}
                        {isLastPage && typewriterDone && (
                            <div className="vn-continue-hint">▼ Click to respond</div>
                        )}
                    </div>
                )}

                {/* Empty state — no messages yet */}
                {!isSending && !isInputMode && !latestMsg && (
                    <div className="vn-textbox-inner" onClick={handleVNClick}>
                        <div className="vn-text vn-hint-text">
                            Click anywhere to begin speaking...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
