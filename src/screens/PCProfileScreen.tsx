import React, { FC, useState } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import { CharacterProfile } from './CharacterProfile';
import { CharacterEditor } from './CharacterEditor';
import { GameIcon } from './GameIcon';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

/** Mana bar section for the witch's profile */
const ManaSection: FC<{ stage: () => Stage }> = ({ stage }) => {
    const stats = stage().currentState.stats;
    const mana = stats.mana;
    const maxMana = stats.maxMana;
    const pct = maxMana > 0 ? (mana / maxMana) * 100 : 0;

    return (
        <div className="char-bio-section mana-section">
            <h4><GameIcon icon="sparkles" size={12} className="icon-mana" /> Mana</h4>
            <div className="mana-bar-container">
                <div className="mana-bar-track">
                    <div
                        className="mana-bar-fill"
                        style={{ width: `${pct}%` }}
                    />
                    <div className="mana-bar-shimmer" />
                </div>
                <span className="mana-bar-label">{mana} / {maxMana}</span>
            </div>
        </div>
    );
};

export const PCProfileScreen: FC<PCProfileScreenProps> = ({ stage, setScreenType }) => {
    const pc = stage().currentState.playerCharacter;
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
                    <ManaSection stage={stage} />
                    <CharacterEditor stage={stage} characterName={pc.name} className="char-bio-section" onChange={() => forceUpdate(n => n + 1)} />
                </>
            }
        />
    );
};
