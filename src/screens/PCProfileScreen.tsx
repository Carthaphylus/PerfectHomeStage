import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import { CharacterProfile } from './CharacterProfile';
import { Pencil, Check, X, Sparkles, RotateCcw } from 'lucide-react';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const PCProfileScreen: FC<PCProfileScreenProps> = ({ stage, setScreenType }) => {
    const pc = stage().currentState.playerCharacter;
    const [editingHistory, setEditingHistory] = useState(false);
    const [historyDraft, setHistoryDraft] = useState('');
    const [editingBackstory, setEditingBackstory] = useState(false);
    const [backstoryDraft, setBackstoryDraft] = useState('');
    const [generatingBackstory, setGeneratingBackstory] = useState(false);
    const [, forceUpdate] = useState(0);

    return (
        <CharacterProfile
            stage={stage}
            character={{
                name: pc.name,
                avatar: pc.avatar,
                color: pc.color,
                title: pc.title,
                description: pc.description,
                traits: pc.traits,
                details: pc.details,
            }}
            onBack={() => setScreenType(ScreenType.MENU)}
            backLabel="&lt; Menu"
            extraSections={
                <>
                <div className="char-bio-section char-backstory-section">
                    <h4>
                        Backstory
                        {!editingBackstory && (
                            <>
                                <button
                                    className="history-edit-btn"
                                    onClick={() => {
                                        setBackstoryDraft(stage().getCharacterBackstory(pc.name));
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
                                        const result = await stage().generateCharacterBackstory(pc.name);
                                        if (result) {
                                            stage().setCharacterBackstory(pc.name, result);
                                            forceUpdate(n => n + 1);
                                        }
                                        setGeneratingBackstory(false);
                                    }}
                                    title={stage().getCharacterBackstory(pc.name) ? 'Regenerate backstory' : 'Generate backstory'}
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
                                        stage().setCharacterBackstory(pc.name, backstoryDraft);
                                        setEditingBackstory(false);
                                        forceUpdate(n => n + 1);
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
                            {stage().getCharacterBackstory(pc.name) || 'No backstory yet — click ✦ to generate one.'}
                        </p>
                    )}
                </div>
                <div className="char-bio-section char-history-section">
                    <h4>
                        History
                        {!editingHistory && (
                            <button
                                className="history-edit-btn"
                                onClick={() => {
                                    setHistoryDraft(stage().getCharacterHistory(pc.name));
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
                                        stage().setCharacterHistory(pc.name, historyDraft);
                                        setEditingHistory(false);
                                        forceUpdate(n => n + 1);
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
                            {stage().getCharacterHistory(pc.name) || 'No history recorded yet.'}
                        </p>
                    )}
                </div>
                </>
            }
        />
    );
};
