import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import { Location } from '../Stage';
import MapImage from '../assets/Images/Skits/Map.png';
import MarkerImg from '../assets/Images/UI/Marker1.png';
import { GameIcon } from './GameIcon';

interface WorldMapScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

interface MapLocation {
    id: Location;
    name: string;
    x: number;
    y: number;
    discovered: boolean;
    description: string;
}

export const WorldMapScreen: FC<WorldMapScreenProps> = ({ stage, setScreenType }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const mapRef = useRef<HTMLDivElement>(null);

    const locations: MapLocation[] = [
        { id: 'Manor', name: 'The Manor', x: 73, y: 45, discovered: true, description: 'Your domain of power' },
        { id: 'Town', name: 'Town', x: 52, y: 40, discovered: true, description: 'A bustling settlement' },
        { id: 'Woods', name: 'The Woods', x: 28.5, y: 67.5, discovered: stage().chatState.discoveredLocations.includes('Woods'), description: 'Dark and mysterious forest' },
        { id: 'Ruins', name: 'Ancient Ruins', x: 44, y: 75, discovered: stage().chatState.discoveredLocations.includes('Ruins'), description: 'Crumbling structures of old' },
        { id: 'Circus', name: 'Circus', x: 79, y: 90, discovered: stage().chatState.discoveredLocations.includes('Circus'), description: 'A place of wonder and danger' },
    ];

    const discoveredLocations = locations.filter(l => l.discovered);

    // The active index is the keyboard-selected one
    const activeIndex = selectedIndex;
    const activeLocation = activeIndex >= 0 ? locations[activeIndex] : null;

    // Keyboard navigation — cycle through discovered locations
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (discoveredLocations.length === 0) return;

        const currentDiscIdx = selectedIndex >= 0
            ? discoveredLocations.findIndex(l => l === locations[selectedIndex])
            : -1;

        let nextDiscIdx = currentDiscIdx;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextDiscIdx = currentDiscIdx < discoveredLocations.length - 1 ? currentDiscIdx + 1 : 0;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            nextDiscIdx = currentDiscIdx > 0 ? currentDiscIdx - 1 : discoveredLocations.length - 1;
        } else if (e.key === 'Enter' && activeLocation?.discovered) {
            e.preventDefault();
            handleExplore(activeLocation);
            return;
        } else {
            return;
        }

        const nextLoc = discoveredLocations[nextDiscIdx];
        const globalIdx = locations.indexOf(nextLoc);
        setSelectedIndex(globalIdx);
    }, [selectedIndex, discoveredLocations, activeLocation]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus the map on mount so keyboard works immediately
    useEffect(() => {
        mapRef.current?.focus();
    }, []);

    const handleLocationClick = (index: number) => {
        const loc = locations[index];
        if (!loc.discovered) return;
        setSelectedIndex(index);
    };

    const handleExplore = (location: MapLocation) => {
        stage().currentState.location = location.id;
        setScreenType(ScreenType.MENU);
    };

    // Marker position — follows the active location with smooth CSS transition
    const markerTarget = activeLocation && activeLocation.discovered ? activeLocation : null;

    return (
        <div className="world-map-screen" ref={mapRef} tabIndex={-1}>
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>World Map</h2>
                <div className="current-location"><GameIcon icon="map-pin" size={12} /> {stage().currentState.location}</div>
            </div>

            {/* Map */}
            <div className="world-map">
                <img src={MapImage} alt="World Map" className="map-image" draggable={false} />

                {/* Floating marker — follows active location */}
                {markerTarget && (
                    <div
                        className={`map-marker ${activeIndex === selectedIndex ? 'selected' : 'hover'}`}
                        style={{
                            left: `${markerTarget.x}%`,
                            top: `${markerTarget.y}%`,
                        }}
                    >
                        <img
                            src={MarkerImg}
                            alt="marker"
                            className="marker-img"
                            draggable={false}
                        />
                    </div>
                )}

                {/* Invisible hit areas for each location */}
                {locations.map((location, i) => (
                    <div
                        key={location.id}
                        className={`map-location-hitarea ${!location.discovered ? 'undiscovered' : ''} ${i === activeIndex ? 'active' : ''}`}
                        style={{
                            left: `${location.x}%`,
                            top: `${location.y}%`,
                        }}
                        onClick={() => handleLocationClick(i)}
                    >
                        {/* Location label */}
                        {location.discovered && (
                            <div className={`location-label ${i === activeIndex ? 'visible' : ''}`}>
                                {location.name}
                            </div>
                        )}
                        {!location.discovered && (
                            <div className="location-undiscovered-icon">
                                <GameIcon icon="help-circle" size={14} className="icon-muted" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Location Info Panel — slides up when a location is active */}
            <div className={`location-info-panel ${activeLocation ? 'visible' : ''}`}>
                {activeLocation && (
                    <>
                        <div className="info-panel-left">
                            <h3>{activeLocation.name}</h3>
                            <p>{activeLocation.description}</p>
                        </div>
                        <div className="info-panel-right">
                            {stage().currentState.location === activeLocation.id ? (
                                <span className="already-here-badge"><GameIcon icon="map-pin" size={10} /> You are here</span>
                            ) : (
                                <button className="explore-button" onClick={() => handleExplore(activeLocation)}>
                                    <GameIcon icon="footprints" size={12} /> Travel
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Keyboard hint */}
            <div className="map-keyboard-hint">
                <span>Arrow keys to navigate</span>
                <span>Enter to travel</span>
            </div>
        </div>
    );
};
