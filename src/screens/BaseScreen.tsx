import React, { FC, useState, useCallback } from 'react';
import { Stage, SceneData, ActiveEvent } from '../Stage';
import { MenuScreen } from './MenuScreen';
import { ManorScreen } from './ManorScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { SceneScreen } from './SceneScreen';
import { HeroesScreen } from './HeroesScreen';
import { CaptivesScreen } from './CaptivesScreen';
import { ServantsScreen } from './ServantsScreen';
import { PCProfileScreen } from './PCProfileScreen';
import { InventoryScreen } from './InventoryScreen';
import { EventScreen } from './EventScreen';
import { StatBar } from './StatBar';

export enum ScreenType {
    MENU = 'menu',
    MANOR = 'manor',
    WORLD_MAP = 'world_map',
    HEROES = 'heroes',
    CAPTIVES = 'captives',
    SERVANTS = 'servants',
    INVENTORY = 'inventory',
    EVENT = 'event',
    SCENE = 'scene',
    PC_PROFILE = 'pc_profile',
}

interface BaseScreenProps {
    stage: () => Stage;
}

export const BaseScreen: FC<BaseScreenProps> = ({ stage }) => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.MENU);
    const [returnScreen, setReturnScreen] = useState<ScreenType>(ScreenType.MENU);

    // Scene data owned by React state — NOT read from Stage
    const [activeScene, setActiveScene] = useState<SceneData | null>(null);

    // Event data owned by React state
    const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);

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

    /** Start an event: creates it on Stage, stores in React state, navigates to EVENT screen */
    const startEvent = useCallback((definitionId: string, target?: string, returnTo?: ScreenType) => {
        const eventData = stage().startEvent(definitionId, target);
        if (eventData) {
            setActiveEvent(eventData);
            setReturnScreen(returnTo || screenType);
            setScreenType(ScreenType.EVENT);
        }
    }, [stage, screenType]);

    /** End event: clears React state and returns to previous screen */
    const endEvent = useCallback(() => {
        setActiveEvent(null);
        setScreenType(returnScreen);
    }, [returnScreen]);

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
                <CaptivesScreen stage={stage} setScreenType={setScreenType} startEvent={startEvent} />
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

            {/* Event screen */}
            {screenType === ScreenType.EVENT && activeEvent && (
                <EventScreen
                    key={`${activeEvent.definitionId}-${activeEvent.log.length}`}
                    stage={stage}
                    event={activeEvent}
                    setScreenType={setScreenType}
                    onEventUpdate={setActiveEvent}
                    onEnd={endEvent}
                />
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
