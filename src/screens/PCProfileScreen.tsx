import React, { FC } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import { CharacterProfile } from './CharacterProfile';

interface PCProfileScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

export const PCProfileScreen: FC<PCProfileScreenProps> = ({ stage, setScreenType }) => {
    const pc = stage().currentState.playerCharacter;

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
                stats: pc.stats,
            }}
            onBack={() => setScreenType(ScreenType.MENU)}
            backLabel="&lt; Menu"
        />
    );
};
