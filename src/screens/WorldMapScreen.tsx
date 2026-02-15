import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage } from '../Stage';
import { Location } from '../Stage';
import MapImage from '../assets/Images/Skits/Map.webp';

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
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

    // Marker positions (x, y are percentages 0-100 of map image)
    // Look at the map and adjust these to match the actual locations in the image
    // Town = buildings cluster upper-center, Manor = center-right, Woods = left forest, etc.
    const locations: MapLocation[] = [
        { id: 'Manor', name: 'The Manor', x: 73, y: 45, discovered: true, description: 'Your domain of power' },
        { id: 'Town', name: 'Town', x: 52, y: 40, discovered: true, description: 'A bustling settlement' },
        { id: 'Woods', name: 'The Woods', x: 28.5, y: 67.5, discovered: stage().chatState.discoveredLocations.includes('Woods'), description: 'Dark and mysterious forest' },
        { id: 'Ruins', name: 'Ancient Ruins', x: 44, y: 75, discovered: stage().chatState.discoveredLocations.includes('Ruins'), description: 'Crumbling structures of old' },
        { id: 'Circus', name: 'Circus', x: 79, y: 90, discovered: stage().chatState.discoveredLocations.includes('Circus'), description: 'A place of wonder and danger' },
    ];

    const handleLocationClick = (location: MapLocation) => {
        if (!location.discovered) return;
        setSelectedLocation(location);
        // Could trigger location event/scene here
    };

    const handleExplore = () => {
        if (selectedLocation) {
            // Update current location
            stage().currentState.location = selectedLocation.id;
            // Could trigger a scene/event
            // setScreenType(ScreenType.SCENE);
        }
    };

    return (
        <div className="world-map-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>World Map</h2>
                <div className="current-location">📍 {stage().currentState.location}</div>
            </div>

            {/* Map */}
            <div className="world-map" style={{ backgroundImage: `url(${MapImage})` }}>
                {locations.map((location) => (
                    <div
                        key={location.id}
                        className={`map-location ${selectedLocation?.id === location.id ? 'selected' : ''} ${!location.discovered ? 'undiscovered' : ''}`}
                        style={{
                            left: `${location.x}%`,
                            top: `${location.y}%`,
                        }}
                        onClick={() => handleLocationClick(location)}
                    >
                        <div className="location-marker">
                            {location.discovered ? '📍' : '❓'}
                        </div>
                        {location.discovered && (
                            <div className="location-name">{location.name}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Location Info Panel */}
            {selectedLocation && (
                <div className="location-info-panel">
                    <h3>{selectedLocation.name}</h3>
                    <p>{selectedLocation.description}</p>
                    <button className="explore-button" onClick={handleExplore}>
                        🚶 Explore
                    </button>
                </div>
            )}
        </div>
    );
};
