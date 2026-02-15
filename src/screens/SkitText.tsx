import React, { FC, useState, useEffect, useRef } from 'react';

// ============================================================
// TEXT FORMATTING
// ============================================================
// *text* → action/emote (muted, darker)
// "text" → dialogue (character color)
// Everything else → narration (default text color)

interface TextSegment {
    type: 'narration' | 'action' | 'dialogue';
    text: string;
}

/** Parse raw text into formatted segments */
export function parseSkitText(raw: string): TextSegment[] {
    const segments: TextSegment[] = [];
    // Regex for *actions* and "dialogue", non-greedy
    const pattern = /(\*[^*]+\*)|("(?:[^"\\]|\\.)*")/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(raw)) !== null) {
        // Push any narration before this match
        if (match.index > lastIndex) {
            const narration = raw.slice(lastIndex, match.index);
            if (narration.trim()) {
                segments.push({ type: 'narration', text: narration });
            } else if (narration) {
                segments.push({ type: 'narration', text: narration });
            }
        }

        if (match[1]) {
            // *action* — strip the asterisks
            segments.push({ type: 'action', text: match[1].slice(1, -1) });
        } else if (match[2]) {
            // "dialogue" — strip the quotes
            segments.push({ type: 'dialogue', text: match[2].slice(1, -1) });
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining narration
    if (lastIndex < raw.length) {
        segments.push({ type: 'narration', text: raw.slice(lastIndex) });
    }

    return segments;
}

// ============================================================
// FORMATTED TEXT COMPONENT
// ============================================================

interface FormattedTextProps {
    text: string;
}

export const FormattedText: FC<FormattedTextProps> = ({ text }) => {
    const segments = parseSkitText(text);
    return (
        <>
            {segments.map((seg, i) => {
                switch (seg.type) {
                    case 'action':
                        return <span key={i} className="skit-fmt-action">{seg.text}</span>;
                    case 'dialogue':
                        return <span key={i} className="skit-fmt-dialogue">{seg.text}</span>;
                    default:
                        return <span key={i} className="skit-fmt-narration">{seg.text}</span>;
                }
            })}
        </>
    );
};

// ============================================================
// TYPEWRITER HOOK
// ============================================================

/** Hook that reveals text word-by-word at the given speed (ms per word). */
export function useTypewriter(fullText: string, speed: number = 40, enabled: boolean = true): {
    displayText: string;
    isTyping: boolean;
} {
    const [wordCount, setWordCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const wordsRef = useRef<string[]>([]);
    const prevTextRef = useRef('');

    useEffect(() => {
        if (!enabled || !fullText) {
            setWordCount(0);
            setIsTyping(false);
            return;
        }

        // If the text changed, start typing from 0
        if (fullText !== prevTextRef.current) {
            prevTextRef.current = fullText;
            wordsRef.current = fullText.split(/(\s+)/); // preserve whitespace
            setWordCount(0);
            setIsTyping(true);
        }
    }, [fullText, enabled]);

    useEffect(() => {
        if (!isTyping) return;

        const totalTokens = wordsRef.current.length;
        if (wordCount >= totalTokens) {
            setIsTyping(false);
            return;
        }

        const timer = setTimeout(() => {
            // Reveal 1 word (skip whitespace-only tokens instantly)
            let next = wordCount + 1;
            while (next < totalTokens && wordsRef.current[next]?.trim() === '') {
                next++;
            }
            setWordCount(next);
        }, speed);

        return () => clearTimeout(timer);
    }, [wordCount, isTyping, speed]);

    if (!enabled || !fullText) return { displayText: fullText, isTyping: false };

    const displayText = wordsRef.current.slice(0, wordCount).join('');
    return { displayText, isTyping };
}

// ============================================================
// TYPEWRITER TEXT COMPONENT
// ============================================================

interface TypewriterTextProps {
    text: string;
    speed?: number;
    enabled?: boolean;
    onComplete?: () => void;
}

export const TypewriterText: FC<TypewriterTextProps> = ({
    text,
    speed = 40,
    enabled = true,
    onComplete,
}) => {
    const { displayText, isTyping } = useTypewriter(text, speed, enabled);
    const completedRef = useRef(false);

    useEffect(() => {
        if (!isTyping && displayText === text && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
        }
    }, [isTyping, displayText, text, onComplete]);

    // Reset completed flag when text changes
    useEffect(() => {
        completedRef.current = false;
    }, [text]);

    return <FormattedText text={displayText} />;
};

// ============================================================
// TYPING INDICATOR
// ============================================================

export const TypingIndicator: FC<{ name: string; avatar: string }> = ({ name, avatar }) => {
    return (
        <div className="skit-message skit-msg-char skit-typing-msg">
            <img className="skit-msg-avatar" src={avatar} alt={name} />
            <div className="skit-msg-body">
                <span className="skit-msg-name">{name}</span>
                <div className="skit-msg-text skit-typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                </div>
            </div>
        </div>
    );
};
