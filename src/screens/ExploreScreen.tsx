import React, { FC, useState, useEffect, useCallback } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Location } from '../Stage';
import { EXPLORE_DATA, LocationExploreData, LocationActivity } from '../data/exploration';
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
}

export const ExploreScreen: FC<ExploreScreenProps> = ({ stage, location, setScreenType, startEvent }) => {
    const [introComplete, setIntroComplete] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<number>(-1);

    const exploreData = EXPLORE_DATA[location];
    const bgImage = LOCATION_BACKGROUNDS[location] || LOCATION_BACKGROUNDS['Unknown'];

    // Set the game location state
    useEffect(() => {
        stage().currentState.location = location;
    }, [location, stage]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!exploreData || !introComplete) return;

        const activities = exploreData.activities;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            setSelectedActivity(prev => Math.min(prev + 1, activities.length - 1));
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setSelectedActivity(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedActivity >= 0) {
            e.preventDefault();
            handleActivityClick(activities[selectedActivity]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setScreenType(ScreenType.WORLD_MAP);
        }
    }, [exploreData, introComplete, selectedActivity]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleActivityClick = (activity: LocationActivity) => {
        startEvent(activity.eventId, undefined, ScreenType.EXPLORE);
    };

    const handleIntroComplete = () => {
        setIntroComplete(true);
    };

    // Skip typewriter on click if not yet complete
    const handleIntroClick = () => {
        if (!introComplete) {
            setIntroComplete(true);
        }
    };

    if (!exploreData) {
        // Fallback for locations without explore data (e.g. Manor)
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

    return (
        <div className="explore-screen">
            {/* Background image */}
            <div className="skit-background" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="skit-overlay" />

            {/* Header */}
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

            {/* Main content area */}
            <div className="explore-body">
                {/* Intro narration */}
                <div className="explore-intro" onClick={handleIntroClick}>
                    {introComplete ? (
                        <FormattedText text={exploreData.intro} />
                    ) : (
                        <TypewriterText
                            text={exploreData.intro}
                            speed={20}
                            onComplete={handleIntroComplete}
                        />
                    )}
                </div>

                {/* Activity options */}
                <div className={`explore-activities ${introComplete ? 'visible' : ''}`}>
                    <div className="activities-header">
                        <span className="activities-label">What would you like to do?</span>
                    </div>
                    <div className="activities-list">
                        {exploreData.activities.map((activity, index) => (
                            <button
                                key={activity.id}
                                className={`activity-button ${selectedActivity === index ? 'selected' : ''}`}
                                onClick={() => handleActivityClick(activity)}
                                onMouseEnter={() => setSelectedActivity(index)}
                            >
                                <div className="activity-icon">
                                    <GameIcon icon={activity.icon} size={18} />
                                </div>
                                <div className="activity-info">
                                    <span className="activity-label">{activity.label}</span>
                                    <span className="activity-tooltip">{activity.tooltip}</span>
                                </div>
                                <div className="activity-arrow">
                                    <GameIcon icon="chevron-right" size={14} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leave option */}
                <div className={`explore-leave ${introComplete ? 'visible' : ''}`}>
                    <button
                        className="leave-button"
                        onClick={() => setScreenType(ScreenType.WORLD_MAP)}
                    >
                        <GameIcon icon="map" size={14} />
                        <span>Return to Map</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
