import {Stage} from "./Stage";
import {useEffect, useState} from "react";
import {DEFAULT_INITIAL, StageBase, InitialData} from "@chub-ai/stages-ts";

// Modify this JSON to include whatever character/user information you want to test.
import InitData from './assets/test-init.json';

export interface TestStageRunnerProps<StageType extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType>, InitStateType, ChatStateType, MessageStateType, ConfigType> {
    factory: (data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) => StageType;
}

/***
 This is a testing class for running a stage locally when testing,
    outside the context of an active chat. See runTests() below for the main idea.
 ***/
export const TestStageRunner = <StageType extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType>,
    InitStateType, ChatStateType, MessageStateType, ConfigType>({ factory }: TestStageRunnerProps<StageType, InitStateType, ChatStateType, MessageStateType, ConfigType>) => {

    // You may need to add a @ts-ignore here,
    //     as the linter doesn't always like the idea of reading types arbitrarily from files
    // @ts-ignore
    const [stage, _setStage] = useState(new Stage({...DEFAULT_INITIAL, ...InitData}));

    // This is what forces the stage node to re-render.
    const [node, setNode] = useState(new Date());

    function refresh() {
        setNode(new Date());
    }

    async function delayedTest(test: any, delaySeconds: number) {
        await new Promise(f => setTimeout(f, delaySeconds * 1000));
        return test();
    }

    /***
     This is the main thing you'll want to modify.
     ***/
    async function runTests() {
        // Test 1: Set initial game state with some progress
        await stage.setState({
            stats: {
                skills: {
                    power: 3,
                    wisdom: 2,
                    charm: 4,
                    speed: 2,
                },
                household: {
                    comfort: 7,
                    obedience: 6,
                },
                gold: 250,
                servants: 2,
                maxServants: 10,
                day: 5,
            },
            location: 'Woods',
            heroes: {
                'Locke': {
                    name: 'Locke',
                    status: 'converting',
                    conversionProgress: 65,
                    location: 'Manor - Dungeon',
                },
                'Felicity': {
                    name: 'Felicity',
                    status: 'captured',
                    conversionProgress: 20,
                    location: 'Manor - Holding Cell',
                },
                'Rogue': {
                    name: 'Rogue',
                    status: 'encountered',
                    conversionProgress: 0,
                    location: 'Town',
                },
            },
            servants: {
                'Citrine': {
                    name: 'Citrine',
                    formerClass: 'Witch',
                    loyalty: 100,
                    assignedTask: 'Brewing potions',
                },
                'Barbarian': {
                    name: 'Barbarian',
                    formerClass: 'Barbarian',
                    loyalty: 85,
                    assignedTask: 'Guard duty',
                },
            },
            inventory: {
                'Hypnotic Pendant': {
                    name: 'Hypnotic Pendant',
                    quantity: 1,
                    type: 'Equipment',
                },
                'Mana Potion': {
                    name: 'Mana Potion',
                    quantity: 5,
                    type: 'Consumable',
                },
                'Gold Coin': {
                    name: 'Gold Coin',
                    quantity: 250,
                    type: 'Currency',
                },
            },
            manorUpgrades: {
                'Bedroom': {
                    name: 'Bedroom',
                    level: 2,
                    description: 'Your personal quarters',
                },
                'Kitchen': {
                    name: 'Kitchen',
                    level: 1,
                    description: 'For preparing meals',
                },
                'Dungeon': {
                    name: 'Dungeon',
                    level: 3,
                    description: 'Where you keep your captives',
                },
            },
            dungeonProgress: {
                currentFloor: 5,
                maxFloor: 10,
                lastBoss: 'Shadow Serpent',
            },
        });
        refresh();

        console.info("Test state loaded with sample Perfect Home data");

        // Test 2: Simulate a user message after 2 seconds
        await delayedTest(async () => {
            const beforePromptResponse = await stage.beforePrompt({
                anonymizedId: "0",
                content: "I explore the woods looking for more heroes to capture.",
                isBot: false,
                promptForId: null,
                identity: "user_0",
                isMain: true,
            });
            console.info("Before prompt response:", beforePromptResponse);
            refresh();
        }, 2);

        // Test 3: Simulate a bot response after 4 seconds
        await delayedTest(async () => {
            const afterPromptResponse = await stage.afterResponse({
                promptForId: null,
                anonymizedId: "2",
                content: "As you wander through the misty woods, you spot Cleric praying near an old shrine. Your corruption rises to 50% as you prepare your hypnotic spell. Your mana drops to 25.",
                isBot: true,
                identity: "witch_bot",
                isMain: true,
            });
            console.info("After response processed:", afterPromptResponse);
            refresh();
        }, 4);
    }

    useEffect(() => {
        // Always do this first, and put any other calls inside the load response.
        stage.load().then((res) => {
            console.info(`Test StageBase Runner load success result was ${res.success}`);
            if(!res.success || res.error != null) {
                console.error(`Error from stage during load, error: ${res.error}`);
            } else {
                runTests().then(() => console.info("Done running tests."));
            }
        });
    }, []);

    return <>
        <div style={{display: 'none'}}>{String(node)}{window.location.href}</div>
        {stage == null ? <div>Stage loading...</div> : stage.render()}
    </>;
}
