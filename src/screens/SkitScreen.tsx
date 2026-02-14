import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';

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
