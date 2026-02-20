import React, { FC, useState, useCallback } from 'react';
import { Stage, SceneData } from '../Stage';
import { MenuScreen } from './MenuScreen';
import { ManorScreen } from './ManorScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { SceneScreen } from './SceneScreen';
import { HeroesScreen } from './HeroesScreen';
import { CaptivesScreen } from './CaptivesScreen';
import { ServantsScreen } from './ServantsScreen';
import { PCProfileScreen } from './PCProfileScreen';
import { InventoryScreen } from './InventoryScreen';
import { StatBar } from './StatBar';

export enum ScreenType {
    MENU = 'menu',
    MANOR = 'manor',
    WORLD_MAP = 'world_map',
    HEROES = 'heroes',
    CAPTIVES = 'captives',
    SERVANTS = 'servants',
    INVENTORY = 'inventory',
    SCENE = 'scene',
    PC_PROFILE = 'pc_profile',
}

interface BaseScreenProps {
    stage: () => Stage;
}

export const BaseScreen: FC<BaseScreenProps> = ({ stage }) => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.MENU);

    // Scene data owned by React state — NOT read from Stage
    const [activeScene, setActiveScene] = useState<SceneData | null>(null);

    /**
     * Start a scene: creates it on Stage (for API use), stores snapshot in React state,
     * and navigates to the SCENE screen. This is the ONLY entry point.
     */
    const startScene = useCallback((participants: string[], location: string) => {
        const sceneData = stage().createScene(participants, location as any);
        setActiveScene(sceneData);
        setScreenType(ScreenType.SCENE);
    }, [stage]);

    /** End scene: clears React state and navigates to menu */
    const endScene = useCallback(() => {
        setActiveScene(null);
        setScreenType(ScreenType.MENU);
    }, []);

    const showStatBar = screenType !== ScreenType.MENU;

    return (
        <div className="base-screen">
            {showStatBar && <StatBar stage={stage} />}

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
            {screenType === ScreenType.CAPTIVES && (
                <CaptivesScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.SERVANTS && (
                <ServantsScreen stage={stage} setScreenType={setScreenType} startScene={startScene} />
            )}
            {screenType === ScreenType.PC_PROFILE && (
                <PCProfileScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.INVENTORY && (
                <InventoryScreen stage={stage} setScreenType={setScreenType} />
            )}

            {/* Scene: keyed by scene.id so a new scene always mounts fresh */}
            {screenType === ScreenType.SCENE && activeScene && (
                <SceneScreen
                    key={activeScene.id}
                    stage={stage}
                    scene={activeScene}
                    setScreenType={setScreenType}
                    onEnd={endScene}
                />
            )}
        </div>
    );
};
