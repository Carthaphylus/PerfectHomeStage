import React, { FC, useState } from 'react';
import { Stage } from '../Stage';
import { MenuScreen } from './MenuScreen';
import { ManorScreen } from './ManorScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { SkitScreen } from './SkitScreen';
import { HeroesScreen } from './HeroesScreen';
import { StatBar } from './StatBar';

export enum ScreenType {
    MENU = 'menu',
    MANOR = 'manor',
    WORLD_MAP = 'world_map',
    HEROES = 'heroes',
    SERVANTS = 'servants',
    SKIT = 'skit',
}

interface BaseScreenProps {
    stage: () => Stage;
}

export const BaseScreen: FC<BaseScreenProps> = ({ stage }) => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.MENU);

    const renderScreen = () => {
        switch (screenType) {
            case ScreenType.MENU:
                return <MenuScreen stage={stage} setScreenType={setScreenType} />;
            case ScreenType.MANOR:
                return <ManorScreen stage={stage} setScreenType={setScreenType} />;
            case ScreenType.WORLD_MAP:
                return <WorldMapScreen stage={stage} setScreenType={setScreenType} />;
            case ScreenType.HEROES:
                return <HeroesScreen stage={stage} setScreenType={setScreenType} />;
            case ScreenType.SKIT:
                return <SkitScreen stage={stage} setScreenType={setScreenType} />;
            default:
                return <MenuScreen stage={stage} setScreenType={setScreenType} />;
        }
    };

    const showStatBar = screenType !== ScreenType.MENU;

    return (
        <div className="base-screen">
            {showStatBar && <StatBar stage={stage} />}
            {renderScreen()}
        </div>
    );
};
