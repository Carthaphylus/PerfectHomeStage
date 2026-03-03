import React, { FC, useState, useEffect, useCallback } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import type { Location } from '../data';
import { EXPLORE_DATA, LocationExploreData, LocationActivity } from '../data/events/exploration/events';
import { FormattedText, TypewriterText } from './SkitText';
import { GameIcon } from './GameIcon';

// Location background images
import ManorBg from '../assets/Images/Skits/Manor - Decorated.png';
import TownBg from '../assets/Images/Skits/Town.webp';
import WoodsBg from '../assets/Images/Skits/Woods.webp';
import RuinsBg from '../assets/Images/Skits/Deep Ruins.png';
import CircusBg from '../assets/Images/Skits/Circus.webp';
import ManorExteriorBg from '../assets/Images/Skits/Manor - Exterior.png';

const LOCATION_BACKGROUNDS: Record<string, string> = {
    Manor: ManorBg,
    Town: TownBg,
    Woods: WoodsBg,
    Ruins: RuinsBg,
    Circus: CircusBg,
    Unknown: ManorExteriorBg,
};

interface ExploreScreenProps {
    stage: () => Stage;
    location: Location;
    setScreenType: (type: ScreenType) => void;
    startEvent: (definitionId: string, target?: string, returnTo?: ScreenType) => void;
    endDay: () => void;
}

// Internal type for the rendered activity list
type ActivityItem =
    | { kind: 'single'; activity: LocationActivity }
    | { kind: 'group'; header: LocationActivity; children: LocationActivity[] };

export const ExploreScreen: FC<ExploreScreenProps> = ({ stage, location, setScreenType, startEvent, endDay }) => {
    const [introComplete, setIntroComplete] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<number>(-1);

    const exploreData = EXPLORE_DATA[location];
    const bgImage = LOCATION_BACKGROUNDS[location] || LOCATION_BACKGROUNDS['Unknown'];

    // Build the merged activity list from static + quest-injected activities.
    // parentActivityId → injected as a sub-choice inside the named parent (group)
    // overridesActivityId → fully replaces the named parent
    const questActivities = exploreData ? stage().getQuestActivitiesForLocation(location) : [];

    const parentMap = new Map<string, LocationActivity[]>();
    const overrideMap = new Map<string, LocationActivity>();
    for (const a of questActivities) {
        if (a.parentActivityId) {
            const list = parentMap.get(a.parentActivityId) || [];
            list.push(a);
            parentMap.set(a.parentActivityId, list);
        } else if (a.overridesActivityId) {
            overrideMap.set(a.overridesActivityId, a);
        }
    }

    const items: ActivityItem[] = exploreData
        ? [
            ...exploreData.activities.map((a): ActivityItem => {
                if (overrideMap.has(a.id)) {
                    return { kind: 'single', activity: overrideMap.get(a.id)! };
                }
                const subs = parentMap.get(a.id);
                if (subs) {
                    // Original activity becomes the first sub-choice, using subLabel if available
                    const defaultSub: LocationActivity = { ...a, label: a.subLabel || a.label };
                    return { kind: 'group', header: a, children: [defaultSub, ...subs] };
                }
                return { kind: 'single', activity: a };
            }),
            // Top-level quest activities (no parent, no override) appended at end
            ...questActivities
                .filter(a => !a.parentActivityId && !a.overridesActivityId)
                .map((a): ActivityItem => ({ kind: 'single', activity: a })),
        ]
        : [];

    // Flat list for keyboard navigation — only selectable leaf activities
    const flatActivities: LocationActivity[] = items.flatMap(item =>
        item.kind === 'group' ? item.children : [item.activity]
    );

    // Set the game location state
    useEffect(() => {
        stage().currentState.location = location;
    }, [location, stage]);

    // Keyboard navigation over flatActivities
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!exploreData || !introComplete) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            setSelectedActivity(prev => Math.min(prev + 1, flatActivities.length - 1));
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setSelectedActivity(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedActivity >= 0) {
            e.preventDefault();
            handleActivityClick(flatActivities[selectedActivity]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setScreenType(ScreenType.WORLD_MAP);
        }
    }, [exploreData, introComplete, selectedActivity, flatActivities]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleActivityClick = (activity: LocationActivity) => {
        startEvent(activity.eventId, undefined, ScreenType.EXPLORE);
    };

    const handleIntroComplete = () => setIntroComplete(true);
    const handleIntroClick = () => { if (!introComplete) setIntroComplete(true); };

    if (!exploreData) {
        return (
            <div className="explore-screen">
                <div className="skit-background" style={{ backgroundImage: `url(${bgImage})` }} />
                <div className="skit-overlay" />
                <div className="explore-content">
                    <p>Nothing to explore here.</p>
                    <button className="back-button" onClick={() => setScreenType(ScreenType.WORLD_MAP)}>
                        &lt; Back
                    </button>
                </div>
            </div>
        );
    }

    // Track flat index as we render to match selectedActivity
    let flatIndex = 0;

    return (
        <div className="explore-screen">
            <div className="skit-background" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="skit-overlay" />

            <div className="explore-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.WORLD_MAP)}>
                    &lt; Map
                </button>
                <div className="explore-header-title">
                    <GameIcon icon="compass" size={14} />
                    <span>{exploreData.name}</span>
                </div>
                <div className="explore-header-location">
                    <GameIcon icon="map-pin" size={10} />
                    <span>{location}</span>
                </div>
            </div>

            <div className="explore-body">
                <div className="explore-intro" onClick={handleIntroClick}>
                    {introComplete ? (
                        <FormattedText text={exploreData.intro} />
                    ) : (
                        <TypewriterText text={exploreData.intro} speed={20} onComplete={handleIntroComplete} />
                    )}
                </div>

                <div className={`explore-activities ${introComplete ? 'visible' : ''}`}>
                    <div className="activities-header">
                        <span className="activities-label">What would you like to do?</span>
                    </div>
                    <div className="activities-list">
                        {items.map(item => {
                            if (item.kind === 'single') {
                                const idx = flatIndex++;
                                return (
                                    <button
                                        key={item.activity.id}
                                        className={`activity-button ${selectedActivity === idx ? 'selected' : ''} ${item.activity.isQuestActivity ? 'quest-activity' : ''}`}
                                        onClick={() => handleActivityClick(item.activity)}
                                        onMouseEnter={() => setSelectedActivity(idx)}
                                    >
                                        <div className="activity-icon">
                                            <GameIcon icon={item.activity.icon} size={18} />
                                        </div>
                                        <div className="activity-info">
                                            <span className="activity-label">{item.activity.label}</span>
                                            <span className="activity-tooltip">{item.activity.tooltip}</span>
                                        </div>
                                        <div className="activity-arrow">
                                            <GameIcon icon="chevron-right" size={14} />
                                        </div>
                                    </button>
                                );
                            } else {
                                // Group: header + sub-choices
                                return (
                                    <div key={item.header.id} className="activity-group">
                                        <div className="activity-group-header">
                                            <div className="activity-icon">
                                                <GameIcon icon={item.header.icon} size={16} />
                                            </div>
                                            <span className="activity-group-label">{item.header.label}</span>
                                        </div>
                                        {item.children.map(child => {
                                            const idx = flatIndex++;
                                            return (
                                                <button
                                                    key={child.id}
                                                    className={`activity-button activity-sub-button ${selectedActivity === idx ? 'selected' : ''} ${child.isQuestActivity ? 'quest-activity' : ''}`}
                                                    onClick={() => handleActivityClick(child)}
                                                    onMouseEnter={() => setSelectedActivity(idx)}
                                                >
                                                    <div className="activity-icon">
                                                        <GameIcon icon={child.icon} size={16} />
                                                    </div>
                                                    <div className="activity-info">
                                                        <span className="activity-label">{child.label}</span>
                                                        <span className="activity-tooltip">{child.tooltip}</span>
                                                    </div>
                                                    <div className="activity-arrow">
                                                        <GameIcon icon="chevron-right" size={12} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                <div className={`explore-leave ${introComplete ? 'visible' : ''}`}>
                    <button className="leave-button" onClick={() => setScreenType(ScreenType.WORLD_MAP)}>
                        <GameIcon icon="map" size={14} />
                        <span>Return to Map</span>
                    </button>
                    <button className="leave-button end-day-leave" onClick={endDay}>
                        <GameIcon icon="sunset" size={14} />
                        <span>Return Home (End Day)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
