import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Stage, SkitMessage } from '../Stage';
import { FormattedText, TypewriterText } from './SkitText';

// ============================================================
// FORMAT-AWARE TEXT PAGINATION
// ============================================================
const MAX_CHARS_PER_PAGE = 280;

/** Collapse paragraph breaks / double newlines into single spaces for VN display */
function collapseWhitespace(text: string): string {
    return text
        .replace(/\n{2,}/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Find all formatting marker ranges so we don't split inside them.
 * Returns [start, end] pairs for *actions* and "dialogue" markers.
 */
function getProtectedRanges(text: string): [number, number][] {
    const ranges: [number, number][] = [];
    const pattern = /(\*[^*]+\*)|("(?:[^"\\]|\\.)*")/g;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
        ranges.push([m.index, m.index + m[0].length]);
    }
    return ranges;
}

function isInsideProtected(pos: number, ranges: [number, number][]): boolean {
    for (const [start, end] of ranges) {
        if (pos > start && pos < end) return true;
    }
    return false;
}

function findSafeBreak(text: string, target: number, ranges: [number, number][]): number {
    // Try sentence end first
    for (let i = target; i >= target * 0.4; i--) {
        if (text[i] === '.' && (text[i + 1] === ' ' || i === text.length - 1) && !isInsideProtected(i + 1, ranges)) {
            return i + 1;
        }
    }
    // Fall back to any safe space
    for (let i = target; i >= target * 0.3; i--) {
        if (text[i] === ' ' && !isInsideProtected(i, ranges)) {
            return i;
        }
    }
    return target;
}

function paginateText(rawText: string): string[] {
    const text = collapseWhitespace(rawText);
    if (text.length <= MAX_CHARS_PER_PAGE) return [text];

    const ranges = getProtectedRanges(text);
    const pages: string[] = [];
    let pos = 0;

    while (pos < text.length) {
        if (text.length - pos <= MAX_CHARS_PER_PAGE) {
            pages.push(text.slice(pos).trim());
            break;
        }

        // Adjust ranges relative to current position
        const absTarget = pos + MAX_CHARS_PER_PAGE;
        const breakAt = findSafeBreak(text, absTarget, ranges);
        pages.push(text.slice(pos, breakAt).trim());
        pos = breakAt;
        // Skip leading whitespace
        while (pos < text.length && text[pos] === ' ') pos++;
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
    const [pendingNpcReveal, setPendingNpcReveal] = useState(false);
    const [displayMsgIndex, setDisplayMsgIndex] = useState(-1);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Sprites: prefer bg-removed images
    const genImages = s.chatState.generatedImages || {};
    const charBgRemoved = genImages[activeSkit.characterName]?.['bg_removed'];
    const pcBgRemoved = genImages[pcName]?.['bg_removed'];
    const charSprite = charBgRemoved || charAvatar;
    const pcSprite = pcBgRemoved || pcAvatar;

    // Current display state
    const latestIdx = skitMessages.length - 1;
    const displayMsg = displayMsgIndex >= 0 && displayMsgIndex < skitMessages.length
        ? skitMessages[displayMsgIndex] : null;
    const isDisplayPlayer = displayMsg?.sender === pcName;

    // Track new messages arriving
    const prevMsgCountRef = useRef(skitMessages.length);
    useEffect(() => {
        const prevCount = prevMsgCountRef.current;
        const newCount = skitMessages.length;
        prevMsgCountRef.current = newCount;
        if (newCount <= 0 || newCount === prevCount) return;

        const newMsg = skitMessages[newCount - 1];
        if (newMsg.sender === pcName) {
            // Player sent — show their message immediately
            setDisplayMsgIndex(newCount - 1);
            setCurrentPage(0);
            setTypewriterDone(true);
            setIsInputMode(false);
            setPendingNpcReveal(false);
        } else {
            // NPC responded — don't auto-show, let user click to continue
            setPendingNpcReveal(true);
        }
    }, [skitMessages.length, pcName]);

    // Initialize on first render
    useEffect(() => {
        if (skitMessages.length > 0 && displayMsgIndex === -1) {
            setDisplayMsgIndex(skitMessages.length - 1);
            setTypewriterDone(skitMessages[skitMessages.length - 1].sender === pcName);
        }
    }, []);

    // Paginate displayed message
    const pages = displayMsg ? paginateText(displayMsg.text) : [];
    const totalPages = pages.length;
    const isLastPage = currentPage >= totalPages - 1;

    // Focus input
    useEffect(() => {
        if (isInputMode) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isInputMode]);

    const revealNpcMessage = () => {
        setPendingNpcReveal(false);
        setDisplayMsgIndex(latestIdx);
        setCurrentPage(0);
        setTypewriterDone(false);
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(p => p + 1);
            setTypewriterDone(false);
        } else {
            setIsInputMode(true);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(p => p - 1);
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

    const handleVNClick = useCallback(() => {
        if (isInputMode || isSending) return;
        if (!displayMsg && !pendingNpcReveal) {
            setIsInputMode(true);
            return;
        }
        if (pendingNpcReveal) {
            revealNpcMessage();
            return;
        }
        if (!isDisplayPlayer && !typewriterDone) {
            setTypewriterDone(true);
            return;
        }
        handleNext();
    }, [isInputMode, isSending, displayMsg, pendingNpcReveal, isDisplayPlayer, typewriterDone, totalPages, currentPage]);

    // Sprite highlighting
    const charData = s.getCharacterData(activeSkit.characterName);
    const showingChar = displayMsg?.sender === activeSkit.characterName && !pendingNpcReveal;
    const pcActive = isSending || pendingNpcReveal || (displayMsg && !showingChar);

    return (
        <div className="vn-view" onClick={handleVNClick}>
            <div className="vn-background" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="vn-bg-overlay" />

            {/* Top bar */}
            <div className="vn-top-bar" onClick={e => e.stopPropagation()}>
                <span className="vn-location">{activeSkit.location}</span>
                <button className="vn-end-btn" onClick={onEnd}>✕</button>
            </div>

            {/* Character sprites */}
            <div className="vn-sprites">
                <div className={`vn-sprite vn-sprite-left ${pcActive ? 'speaking' : 'dimmed'}`}>
                    <img src={pcSprite} alt={pcName} />
                </div>
                <div className={`vn-sprite vn-sprite-right ${showingChar ? 'speaking' : 'dimmed'}`}>
                    <img src={charSprite} alt={activeSkit.characterName} />
                </div>
            </div>

            {/* Text box */}
            <div className="vn-textbox" onClick={e => e.stopPropagation()}>

                {/* ── INPUT MODE ── */}
                {!isSending && isInputMode && !pendingNpcReveal && (
                    <div className="vn-textbox-inner vn-input-mode">
                        <div className="vn-speaker" style={{ color: '#c8aa6e' }}>{pcName}</div>
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
                        >▶</button>
                    </div>
                )}

                {/* ── SENDING: show PC message + waiting dots ── */}
                {isSending && displayMsg && (
                    <div className="vn-textbox-inner">
                        <div className="vn-speaker" style={{ color: '#c8aa6e' }}>{pcName}</div>
                        <div className="vn-text">
                            <FormattedText text={collapseWhitespace(displayMsg.text)} />
                        </div>
                        <div className="vn-waiting-hint">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                        </div>
                    </div>
                )}

                {/* ── SENDING: no message yet ── */}
                {isSending && !displayMsg && (
                    <div className="vn-textbox-inner">
                        <div className="vn-text vn-typing-dots">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                        </div>
                    </div>
                )}

                {/* ── PENDING NPC: still showing PC message + "click to continue" ── */}
                {!isSending && pendingNpcReveal && displayMsg && (
                    <div className="vn-textbox-inner" onClick={handleVNClick}>
                        <div className="vn-speaker" style={{ color: '#c8aa6e' }}>{pcName}</div>
                        <div className="vn-text">
                            <FormattedText text={collapseWhitespace(displayMsg.text)} />
                        </div>
                        <div className="vn-continue-hint">▼ Click to continue</div>
                    </div>
                )}

                {/* ── NORMAL MESSAGE DISPLAY ── */}
                {!isSending && !isInputMode && !pendingNpcReveal && displayMsg && (
                    <div className="vn-textbox-inner" onClick={handleVNClick}>
                        <div
                            className="vn-speaker"
                            style={{ color: showingChar ? (charData?.color || '#c8aa6e') : '#c8aa6e' }}
                        >
                            {displayMsg.sender}
                        </div>
                        <div className="vn-text">
                            {!isDisplayPlayer && currentPage === 0 && !typewriterDone ? (
                                <TypewriterText
                                    text={pages[0] || ''}
                                    speed={40}
                                    onComplete={() => setTypewriterDone(true)}
                                />
                            ) : (
                                <FormattedText text={pages[currentPage] || ''} />
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="vn-page-nav">
                                <button className="vn-page-btn"
                                    onClick={e => { e.stopPropagation(); handlePrev(); }}
                                    disabled={currentPage === 0}
                                >◀</button>
                                <span className="vn-page-count">{currentPage + 1}/{totalPages}</span>
                                <button className="vn-page-btn"
                                    onClick={e => { e.stopPropagation(); handleNext(); }}
                                    disabled={isLastPage}
                                >▶</button>
                            </div>
                        )}
                        {isLastPage && typewriterDone && (
                            <div className="vn-continue-hint">▼ Click to respond</div>
                        )}
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {!isSending && !isInputMode && !displayMsg && !pendingNpcReveal && (
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
