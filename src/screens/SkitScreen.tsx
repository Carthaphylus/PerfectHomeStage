import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, CHUB_AVATARS } from '../Stage';

interface SkitScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export interface SkitData {
    background: string;
    speaker?: string;
    portrait?: string;
    text: string;
    choices?: { label: string; action: () => void }[];
}

export const SkitScreen: FC<SkitScreenProps> = ({ stage, setScreenType }) => {
    // BG Removal test state
    const [bgTestStatus, setBgTestStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);
    const [bgTestError, setBgTestError] = useState<string | null>(null);

    const testAvatarUrl = CHUB_AVATARS.citrine;

    const handleTestBgRemoval = async () => {
        setBgTestStatus('loading');
        setBgTestError(null);
        setBgRemovedUrl(null);
        try {
            const result = await stage().generator.removeBackground({ image: testAvatarUrl });
            if (result && result.url) {
                setBgRemovedUrl(result.url);
                setBgTestStatus('done');
            } else {
                setBgTestError('No result returned from API.');
                setBgTestStatus('error');
            }
        } catch (err: any) {
            setBgTestError(err?.message || 'Unknown error');
            setBgTestStatus('error');
        }
    };

    // Example skit data - would come from stage state
    const [currentSkit, setCurrentSkit] = useState<SkitData>({
        background: 'https://via.placeholder.com/800x600/2a1a3a/ffffff?text=Manor+Hall',
        speaker: 'Mysterious Voice',
        portrait: 'https://via.placeholder.com/150/6a4a7a/ffffff?text=?',
        text: 'Welcome to your manor, Witch of the Woods. Your journey of revenge begins here...',
        choices: [
            { label: 'Continue...', action: () => setScreenType(ScreenType.MENU) },
        ],
    });

    return (
        <div className="skit-screen">
            {/* Background */}
            <div
                className="skit-background"
                style={{ backgroundImage: `url(${currentSkit.background})` }}
            />

            {/* BG Removal Test Panel */}
            <div className="bg-test-panel">
                <h4>BG Removal Test</h4>
                <div className="bg-test-images">
                    <div className="bg-test-card">
                        <div className="bg-test-label">Original</div>
                        <img src={testAvatarUrl} alt="Original" />
                    </div>
                    <div className="bg-test-card">
                        <div className="bg-test-label">No Background</div>
                        {bgTestStatus === 'idle' && <div className="bg-test-placeholder">Click test below</div>}
                        {bgTestStatus === 'loading' && <div className="bg-test-placeholder loading">Processing...</div>}
                        {bgTestStatus === 'error' && <div className="bg-test-placeholder error">{bgTestError}</div>}
                        {bgTestStatus === 'done' && bgRemovedUrl && (
                            <img src={bgRemovedUrl} alt="BG Removed" />
                        )}
                    </div>
                </div>
                <button
                    className="choice-button bg-test-btn"
                    onClick={handleTestBgRemoval}
                    disabled={bgTestStatus === 'loading'}
                >
                    {bgTestStatus === 'loading' ? 'Removing BG...' : 'Test BG Removal'}
                </button>
            </div>

            {/* Character Portrait */}
            {currentSkit.portrait && currentSkit.speaker && (
                <div className="skit-portrait-container">
                    <img src={currentSkit.portrait} alt={currentSkit.speaker} className="skit-portrait" />
                    <div className="speaker-name">{currentSkit.speaker}</div>
                </div>
            )}

            {/* Text Box */}
            <div className="skit-textbox">
                <div className="skit-text">{currentSkit.text}</div>

                {/* Choices */}
                {currentSkit.choices && currentSkit.choices.length > 0 && (
                    <div className="skit-choices">
                        {currentSkit.choices.map((choice, index) => (
                            <button
                                key={index}
                                className="choice-button"
                                onClick={choice.action}
                            >
                                {choice.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
