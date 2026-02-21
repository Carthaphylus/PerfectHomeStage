import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import { CharacterProfile } from './CharacterProfile';
import { CharacterEditor } from './CharacterEditor';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

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
                <CharacterEditor stage={stage} characterName={pc.name} className="char-bio-section" onChange={() => forceUpdate(n => n + 1)} />
            }
        />
    );
};
