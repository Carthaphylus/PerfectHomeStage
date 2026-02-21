import React, { FC, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getTraitDefinition, TraitScope } from '../Stage';
import { GameIcon } from './GameIcon';

interface TraitChipProps {
    trait: string;
    className?: string;
    color?: string;
    source?: TraitScope;
}

export const TraitChip: FC<TraitChipProps> = ({ trait, className = '', color, source }) => {
    const definition = getTraitDefinition(trait);
    const displayScope = source || definition.scope;
    const chipRef = useRef<HTMLSpanElement>(null);
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const scopeIcon: Record<string, string> = {
        character: 'diamond',
        role: 'home',
        room: 'home',
        situational: 'sparkle',
    };

    const scopeLabel: Record<string, string> = {
        character: 'character',
        role: 'room role',
        room: 'room role',
        situational: 'situational',
    };

    const handleMouseEnter = useCallback(() => {
        if (chipRef.current) {
            const rect = chipRef.current.getBoundingClientRect();
            setPos({
                top: rect.top,
                left: rect.left + rect.width / 2,
            });
        }
        setShow(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setShow(false);
    }, []);

    const tooltip = show ? ReactDOM.createPortal(
        <span
            className={`trait-tooltip visible`}
            role="tooltip"
            aria-label={`${definition.name} details`}
            style={{
                position: 'fixed',
                top: `${pos.top}px`,
                left: `${pos.left}px`,
            }}
        >
            <span className="trait-tooltip-head">
                <span className="trait-tooltip-title">{definition.name}</span>
                <span className={`trait-tooltip-scope scope-${displayScope}`}>
                        <span className="scope-icon"><GameIcon icon={scopeIcon[displayScope] || 'sparkle'} size={10} /></span>
                        <span className="scope-label">{scopeLabel[displayScope] || displayScope}</span>
                </span>
            </span>

            <span className="trait-tooltip-summary">{definition.summary}</span>

            <span className="trait-tooltip-section">
                <span className="section-label">Properties</span>
                <ul>
                    {definition.properties.map((property, index) => (
                        <li key={`property-${index}`}>{property}</li>
                    ))}
                </ul>
            </span>

            <span className="trait-tooltip-section">
                <span className="section-label">Effects</span>
                <ul>
                    {definition.effects.map((effect, index) => (
                        <li key={`effect-${index}`}>{effect}</li>
                    ))}
                </ul>
            </span>
        </span>,
        document.body
    ) : null;

    return (
        <span
            ref={chipRef}
            className={`trait-chip ${className}`.trim()}
            style={color ? { borderColor: color, color } : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {trait}
            {tooltip}
        </span>
    );
};
