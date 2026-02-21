import React, { FC, useState } from 'react';
import { Pencil, Check, X, Sparkles, RotateCcw } from 'lucide-react';
import { Stage } from '../Stage';

/**
 * Shared backstory & history editor used by CaptivesScreen, HeroesScreen,
 * ServantsScreen, and PCProfileScreen.
 *
 * Encapsulates the identical editing UI pattern that was previously
 * duplicated (~120 lines × 4 files).
 */
export interface CharacterEditorProps {
    stage: () => Stage;
    characterName: string;
    /** Extra CSS class on wrapper, e.g. "char-bio-section" */
    className?: string;
    /** Inline style applied to each section wrapper */
    style?: React.CSSProperties;
    /** Callback after any save / generate to trigger parent re-render */
    onChange?: () => void;
}

export const CharacterEditor: FC<CharacterEditorProps> = ({
    stage,
    characterName,
    className,
    style,
    onChange,
}) => {
    const [editingBackstory, setEditingBackstory] = useState(false);
    const [backstoryDraft, setBackstoryDraft] = useState('');
    const [generatingBackstory, setGeneratingBackstory] = useState(false);
    const [editingHistory, setEditingHistory] = useState(false);
    const [historyDraft, setHistoryDraft] = useState('');

    const triggerChange = () => onChange?.();

    const bsClass = className
        ? `${className} char-backstory-section`
        : 'char-backstory-section';
    const hClass = className
        ? `${className} char-history-section`
        : 'char-history-section';

    return (
        <>
            {/* ── Backstory ── */}
            <div className={bsClass} style={style}>
                <h4>
                    Backstory
                    {!editingBackstory && (
                        <>
                            <button
                                className="history-edit-btn"
                                onClick={() => {
                                    setBackstoryDraft(stage().getCharacterBackstory(characterName));
                                    setEditingBackstory(true);
                                }}
                                title="Edit backstory"
                            >
                                <Pencil size={10} />
                            </button>
                            <button
                                className="history-edit-btn backstory-gen-btn"
                                disabled={generatingBackstory}
                                onClick={async () => {
                                    setGeneratingBackstory(true);
                                    const result = await stage().generateCharacterBackstory(characterName);
                                    if (result) {
                                        stage().setCharacterBackstory(characterName, result);
                                        triggerChange();
                                    }
                                    setGeneratingBackstory(false);
                                }}
                                title={stage().getCharacterBackstory(characterName) ? 'Regenerate backstory' : 'Generate backstory'}
                            >
                                {generatingBackstory ? <RotateCcw size={10} className="spin" /> : <Sparkles size={10} />}
                            </button>
                        </>
                    )}
                </h4>
                {editingBackstory ? (
                    <div className="history-edit-container">
                        <textarea
                            className="history-textarea"
                            value={backstoryDraft}
                            onChange={e => setBackstoryDraft(e.target.value)}
                            rows={5}
                            placeholder="No backstory yet — click the sparkle icon to generate one."
                        />
                        <div className="history-edit-actions">
                            <button
                                className="history-save-btn"
                                onClick={() => {
                                    stage().setCharacterBackstory(characterName, backstoryDraft);
                                    setEditingBackstory(false);
                                    triggerChange();
                                }}
                            >
                                <Check size={10} /> Save
                            </button>
                            <button
                                className="history-cancel-btn"
                                onClick={() => setEditingBackstory(false)}
                            >
                                <X size={10} /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="history-text">
                        {stage().getCharacterBackstory(characterName) || 'No backstory yet — click ✦ to generate one.'}
                    </p>
                )}
            </div>

            {/* ── History ── */}
            <div className={hClass} style={style}>
                <h4>
                    History
                    {!editingHistory && (
                        <button
                            className="history-edit-btn"
                            onClick={() => {
                                setHistoryDraft(stage().getCharacterHistory(characterName));
                                setEditingHistory(true);
                            }}
                            title="Edit history"
                        >
                            <Pencil size={10} />
                        </button>
                    )}
                </h4>
                {editingHistory ? (
                    <div className="history-edit-container">
                        <textarea
                            className="history-textarea"
                            value={historyDraft}
                            onChange={e => setHistoryDraft(e.target.value)}
                            rows={5}
                            placeholder="No history recorded yet..."
                        />
                        <div className="history-edit-actions">
                            <button
                                className="history-save-btn"
                                onClick={() => {
                                    stage().setCharacterHistory(characterName, historyDraft);
                                    setEditingHistory(false);
                                    triggerChange();
                                }}
                            >
                                <Check size={10} /> Save
                            </button>
                            <button
                                className="history-cancel-btn"
                                onClick={() => setEditingHistory(false)}
                            >
                                <X size={10} /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="history-text">
                        {stage().getCharacterHistory(characterName) || 'No history recorded yet.'}
                    </p>
                )}
            </div>
        </>
    );
};
