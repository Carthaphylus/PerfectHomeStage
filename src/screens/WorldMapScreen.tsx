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
        { id: 'Ruins', name: 'Ancient Ruins', x: 44, y: 75, discovered: true, description: 'Crumbling structures of old' },
        { id: 'Circus', name: 'Circus', x: 79, y: 90, discovered: true, description: 'A place of wonder and danger' },
    ];

    const discoveredLocations = locations.filter(l => l.discovered);

    // The active index is the keyboard-selected one
    const activeIndex = selectedIndex;
    const activeLocation = activeIndex >= 0 ? locations[activeIndex] : null;

    // Keyboard navigation — spatial: go to nearest location in arrow direction
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (discoveredLocations.length === 0) return;

        const dirMap: Record<string, { dx: number; dy: number }> = {
            ArrowRight: { dx: 1, dy: 0 },
            ArrowLeft:  { dx: -1, dy: 0 },
            ArrowDown:  { dx: 0, dy: 1 },
            ArrowUp:    { dx: 0, dy: -1 },
        };

        const dir = dirMap[e.key];

        if (dir) {
            e.preventDefault();

            // Nothing selected yet — pick the first discovered location
            if (selectedIndex < 0) {
                setSelectedIndex(locations.indexOf(discoveredLocations[0]));
                return;
            }

            const current = locations[selectedIndex];
            let bestIdx = -1;
            let bestScore = Infinity;

            for (const loc of discoveredLocations) {
                if (loc === current) continue;
                const dx = loc.x - current.x;
                const dy = loc.y - current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) continue;

                // cosAngle: how aligned the candidate is with the pressed direction (1 = perfect, 0 = perpendicular)
                const cosAngle = (dx * dir.dx + dy * dir.dy) / dist;

                // Must be broadly in the right direction (within ~75° cone)
                if (cosAngle <= 0.26) continue;

                // Score = distance / cosAngle² — heavily rewards directional alignment
                const score = dist / (cosAngle * cosAngle);
                if (score < bestScore) {
                    bestScore = score;
                    bestIdx = locations.indexOf(loc);
                }
            }

            if (bestIdx >= 0) {
                setSelectedIndex(bestIdx);
            }
        } else if (e.key === 'Enter' && activeLocation?.discovered) {
            e.preventDefault();
            handleExplore(activeLocation);
        }
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
