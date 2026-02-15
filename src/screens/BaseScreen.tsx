import React, { FC, useState, useCallback, useEffect } from 'react';
import { Stage } from '../Stage';
import { MenuScreen } from './MenuScreen';
import { ManorScreen } from './ManorScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { SkitScreen } from './SkitScreen';
import { HeroesScreen } from './HeroesScreen';
import { ServantsScreen } from './ServantsScreen';
import { PCProfileScreen } from './PCProfileScreen';
import { StatBar } from './StatBar';

export enum ScreenType {
    MENU = 'menu',
    MANOR = 'manor',
    WORLD_MAP = 'world_map',
    HEROES = 'heroes',
    SERVANTS = 'servants',
    SKIT = 'skit',
    PC_PROFILE = 'pc_profile',
}

interface BaseScreenProps {
    stage: () => Stage;
}

export const BaseScreen: FC<BaseScreenProps> = ({ stage }) => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.MENU);

    // Guard: if we land on SKIT but there's no active skit, redirect to SERVANTS
    useEffect(() => {
        if (screenType === ScreenType.SKIT && !stage().getActiveSkit()) {
            console.warn('[BaseScreen] SKIT screen with no activeSkit — redirecting to SERVANTS');
            setScreenType(ScreenType.SERVANTS);
        }
    }, [screenType, stage]);

    const showStatBar = screenType !== ScreenType.MENU;

    // Read skitId so SkitScreen gets a fresh key on every startSkit()
    const skitId = stage().getSkitId();

    return (
        <div className="base-screen">
            {showStatBar && <StatBar stage={stage} />}

            {/* Non-skit screens: use switch */}
            {screenType === ScreenType.MENU && (
                <MenuScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.MANOR && (
                <ManorScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.WORLD_MAP && (
                <WorldMapScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.HEROES && (
                <HeroesScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.SERVANTS && (
                <ServantsScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.PC_PROFILE && (
                <PCProfileScreen stage={stage} setScreenType={setScreenType} />
            )}

            {/* Skit screen: keyed by skitId so it fully remounts on new skit */}
            {screenType === ScreenType.SKIT && (
                <SkitScreen key={skitId} stage={stage} setScreenType={setScreenType} />
            )}
        </div>
    );
};
