import React, { FC } from 'react';
import { Stage } from '../Stage';

// Skill icons
import PowerIcon from '../assets/Images/Stats/Power.webp';
import WisdomIcon from '../assets/Images/Stats/Wisdom.webp';
import CharmIcon from '../assets/Images/Stats/Charm.webp';
import SpeedIcon from '../assets/Images/Stats/Speed.webp';

// Resource icons
import GoldIcon from '../assets/Images/Resources/GoldIcon.png';
import ComfortIcon from '../assets/Images/Resources/HouseholdComfort.png';
import ObedienceIcon from '../assets/Images/Resources/HouseholdObedience.png';
import ServantsIcon from '../assets/Images/Resources/Servants.png';

interface StatBarProps {
    stage: () => Stage;
}

export const StatBar: FC<StatBarProps> = ({ stage }) => {
    const s = stage().currentState.stats;

    return (
        <div className="stat-bar">
            <div className="stat-bar-group skills">
                <div className="stat-item" title="Power">
                    <img src={PowerIcon} alt="Power" className="stat-icon" />
                    <span className="stat-value">{s.skills.power}</span>
                </div>
                <div className="stat-item" title="Wisdom">
                    <img src={WisdomIcon} alt="Wisdom" className="stat-icon" />
                    <span className="stat-value">{s.skills.wisdom}</span>
                </div>
                <div className="stat-item" title="Charm">
                    <img src={CharmIcon} alt="Charm" className="stat-icon" />
                    <span className="stat-value">{s.skills.charm}</span>
                </div>
                <div className="stat-item" title="Speed">
                    <img src={SpeedIcon} alt="Speed" className="stat-icon" />
                    <span className="stat-value">{s.skills.speed}</span>
                </div>
            </div>

            <div className="stat-bar-group resources">
                <div className="stat-item" title="Gold">
                    <img src={GoldIcon} alt="Gold" className="stat-icon" />
                    <span className="stat-value">{s.gold}</span>
                </div>
                <div className="stat-item" title="Servants">
                    <img src={ServantsIcon} alt="Servants" className="stat-icon" />
                    <span className="stat-value">{s.servants}/{s.maxServants}</span>
                </div>
            </div>

            <div className="stat-bar-group household">
                <div className="stat-item bar-stat" title={`Comfort: ${s.household.comfort}`}>
                    <img src={ComfortIcon} alt="Comfort" className="stat-icon" />
                    <div className="stat-blocks comfort-blocks">
                        {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} className={`stat-block ${i < s.household.comfort ? 'filled' : 'empty'}`} />
                        ))}
                        <span className="stat-blocks-value">{s.household.comfort}</span>
                    </div>
                </div>
                <div className="stat-item bar-stat" title={`Obedience: ${s.household.obedience}`}>
                    <img src={ObedienceIcon} alt="Obedience" className="stat-icon" />
                    <div className="stat-blocks obedience-blocks">
                        {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} className={`stat-block ${i < s.household.obedience ? 'filled' : 'empty'}`} />
                        ))}
                        <span className="stat-blocks-value">{s.household.obedience}</span>
                    </div>
                </div>
            </div>

            <div className="stat-bar-group day">
                <div className="stat-item" title="Current Day">
                    <span className="day-label">Day {s.day}</span>
                </div>
            </div>
        </div>
    );
};
