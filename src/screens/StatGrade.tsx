import React, { FC } from 'react';
import { numberToGrade, getGradeColor, StatGrade as StatGradeType, StatName, STAT_DEFINITIONS } from '../data';

export interface StatGradeProps {
    /** The name of the stat (e.g., 'prowess', 'expertise') */
    statName: StatName;
    
    /** Numeric value 0-100 */
    value: number;
    
    /** Display size */
    size?: 'compact' | 'normal' | 'large';
    
    /** Show numeric value on hover */
    showValue?: boolean;
}

/**
 * Displays a stat as a letter grade (F- to S++) with color coding
 */
export const StatGrade: FC<StatGradeProps> = ({ 
    statName, 
    value, 
    size = 'normal',
    showValue = true,
}) => {
    const grade = numberToGrade(value);
    const color = getGradeColor(grade);
    const statDef = STAT_DEFINITIONS.find(s => s.name === statName);
    
    const title = showValue && statDef 
        ? `${statDef.label}: ${grade} (${value}/100)\n${statDef.description}`
        : undefined;

    return (
        <div 
            className={`stat-grade stat-grade-${size}`}
            style={{ borderColor: color, color: color }}
            title={title}
        >
            {size !== 'compact' && statDef && (
                <span className="stat-icon">{statDef.icon}</span>
            )}
            {size === 'large' && statDef && (
                <span className="stat-label">{statDef.label}</span>
            )}
            <span className="stat-grade-letter">{grade}</span>
        </div>
    );
};

/**
 * Displays all stats for a character in a grid
 */
export interface StatGridProps {
    stats: Record<StatName, number>;
    size?: 'compact' | 'normal' | 'large';
}

export const StatGrid: FC<StatGridProps> = ({ stats, size = 'normal' }) => {
    return (
        <div className={`stat-grid stat-grid-${size}`}>
            {STAT_DEFINITIONS.map(statDef => (
                <StatGrade
                    key={statDef.name}
                    statName={statDef.name}
                    value={stats[statDef.name] || 0}
                    size={size}
                />
            ))}
        </div>
    );
};
