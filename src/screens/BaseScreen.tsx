import React, { FC, useState, useCallback } from 'react';
import type { Stage } from '../Stage';
import type { SceneData, ActiveEvent, Location, TurnSummary } from '../data';
import { StartMenuScreen } from './StartMenuScreen';
import { MenuScreen } from './MenuScreen';
import { ManorScreen } from './ManorScreen';
import { WorldMapScreen } from './WorldMapScreen';
import { SceneScreen } from './SceneScreen';
import { HeroesScreen } from './HeroesScreen';
import { CaptivesScreen } from './CaptivesScreen';
import { ServantsScreen } from './ServantsScreen';
import { PCProfileScreen } from './PCProfileScreen';
import { InventoryScreen } from './InventoryScreen';
import { ItemLibrary } from './ItemLibrary';
import { EventScreen } from './EventScreen';
import { ConversionScreen } from './ConversionScreen';
import { ExploreScreen } from './ExploreScreen';
import { TurnSummaryScreen } from './TurnSummaryScreen';
import { QuestScreen } from './QuestScreen';
import { StatBar } from './StatBar';
import { ScreenType } from './screenTypes';

interface BaseScreenProps {
    stage: () => Stage;
}

export const BaseScreen: FC<BaseScreenProps> = ({ stage }) => {
    const [screenType, setScreenType] = useState<ScreenType>(ScreenType.START_MENU);
    const [returnScreen, setReturnScreen] = useState<ScreenType>(ScreenType.MENU);

    // Scene data owned by React state — NOT read from Stage
    const [activeScene, setActiveScene] = useState<SceneData | null>(null);

    // Event data owned by React state
    const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);

    // Conversion target name
    const [conversionTarget, setConversionTarget] = useState<string | null>(null);

    // Explore location
    const [exploreLocation, setExploreLocation] = useState<Location | null>(null);

    // Turn summary data
    const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);

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

    /** Start a conversion: navigate to conversion screen */
    const startConversion = useCallback((heroName: string) => {
        setConversionTarget(heroName);
        setScreenType(ScreenType.CONVERSION);
    }, []);

    /** End conversion: navigates to servants screen */
    const endConversion = useCallback(() => {
        setConversionTarget(null);
        setScreenType(ScreenType.SERVANTS);
    }, []);

    /** Start a servant chat via the event system */
    const startServantChat = useCallback((servantName: string, location: string) => {
        const eventData = stage().startServantChat(servantName, location);
        if (eventData) {
            setActiveEvent(eventData);
            setReturnScreen(ScreenType.SERVANTS);
            setScreenType(ScreenType.EVENT);
        }
    }, [stage]);

    /** Start a multi-servant chat via the event system */
    const startMultiServantChat = useCallback((servantNames: string[], location: string) => {
        const eventData = stage().startMultiServantChat(servantNames, location);
        if (eventData) {
            setActiveEvent(eventData);
            setReturnScreen(ScreenType.SERVANTS);
            setScreenType(ScreenType.EVENT);
        }
    }, [stage]);

    /** Start exploring a location */
    const startExplore = useCallback((location: Location) => {
        setExploreLocation(location);
        setScreenType(ScreenType.EXPLORE);
    }, []);

    /** Trigger end-of-day: runs turn logic, shows summary screen */
    const endDay = useCallback(() => {
        const summary = stage().endDay();
        setTurnSummary(summary);
        setScreenType(ScreenType.TURN_SUMMARY);
    }, [stage]);

    /** Called when the player clicks Continue on the turn summary */
    const continueTurn = useCallback(() => {
        setTurnSummary(null);
        setScreenType(ScreenType.MENU);
    }, []);

    const showStatBar = screenType !== ScreenType.START_MENU && screenType !== ScreenType.MENU && screenType !== ScreenType.TURN_SUMMARY;

    return (
        <div className="base-screen">
            {showStatBar && <StatBar stage={stage} />}

            {screenType === ScreenType.START_MENU && (
                <StartMenuScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.MENU && (
                <MenuScreen stage={stage} setScreenType={setScreenType} endDay={endDay} />
            )}
            {screenType === ScreenType.MANOR && (
                <ManorScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.WORLD_MAP && (
                <WorldMapScreen stage={stage} setScreenType={setScreenType} startExplore={startExplore} />
            )}
            {screenType === ScreenType.HEROES && (
                <HeroesScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.CAPTIVES && (
                <CaptivesScreen stage={stage} setScreenType={setScreenType} startEvent={startEvent} startConversion={startConversion} />
            )}
            {screenType === ScreenType.SERVANTS && (
                <ServantsScreen stage={stage} setScreenType={setScreenType} startScene={startScene} startServantChat={startServantChat} startMultiServantChat={startMultiServantChat} />
            )}
            {screenType === ScreenType.PC_PROFILE && (
                <PCProfileScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.INVENTORY && (
                <InventoryScreen stage={stage} setScreenType={setScreenType} />
            )}
            {screenType === ScreenType.ITEM_LIBRARY && (
                <ItemLibrary stage={stage} onClose={() => setScreenType(ScreenType.INVENTORY)} />
            )}

            {/* Quest screen */}
            {screenType === ScreenType.QUESTS && (
                <QuestScreen stage={stage} setScreenType={setScreenType} startEvent={startEvent} />
            )}

            {/* Explore screen */}
            {screenType === ScreenType.EXPLORE && exploreLocation && (
                <ExploreScreen
                    key={`explore-${exploreLocation}`}
                    stage={stage}
                    location={exploreLocation}
                    setScreenType={setScreenType}
                    startEvent={startEvent}
                    endDay={endDay}
                />
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

            {/* Conversion screen */}
            {screenType === ScreenType.CONVERSION && conversionTarget && (
                <ConversionScreen
                    key={`conversion-${conversionTarget}`}
                    stage={stage}
                    heroName={conversionTarget}
                    setScreenType={setScreenType}
                    onComplete={endConversion}
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

            {/* Turn summary screen */}
            {screenType === ScreenType.TURN_SUMMARY && turnSummary && (
                <TurnSummaryScreen
                    stage={stage}
                    summary={turnSummary}
                    setScreenType={setScreenType}
                    onContinue={continueTurn}
                />
            )}
        </div>
    );
};
