import React, { FC, useState, useEffect } from 'react';
import { ScreenType } from './screenTypes';
import type { Stage } from '../Stage';
import type { TurnSummary, TurnTaskResult } from '../data';
import { GameIcon } from './GameIcon';

// Resource icons
import GoldIcon from '../assets/Images/Resources/GoldIcon.png';
import ComfortIcon from '../assets/Images/Resources/HouseholdComfort.png';
import ObedienceIcon from '../assets/Images/Resources/HouseholdObedience.png';

interface TurnSummaryScreenProps {
    stage: () => Stage;
    summary: TurnSummary;
    setScreenType: (type: ScreenType) => void;
    onContinue: () => void;
}

/** Quality → color map */
const QUALITY_COLORS: Record<string, string> = {
    excellent: '#7dd4a0',
    standard: '#c8aa6e',
    poor: '#c87d6e',
};

const QUALITY_LABELS: Record<string, string> = {
    excellent: 'Excellent',
    standard: 'Standard',
    poor: 'Poor',
};

export const TurnSummaryScreen: FC<TurnSummaryScreenProps> = ({ stage, summary, onContinue }) => {
    const [phase, setPhase] = useState(0); // 0→header, 1→ledger, 2→tasks, 3→servants, 4→ready

    const totalPhases = 4;

    // Phase auto-advance
    useEffect(() => {
        if (phase < totalPhases) {
            const delay = phase === 0 ? 600 : 400;
            const timer = setTimeout(() => setPhase(p => p + 1), delay);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    const skipToReady = () => setPhase(totalPhases);

    // Determine what we have
    const hasCompletedTasks = summary.completedTasks.length > 0;
    const hasProgressingTasks = summary.taskProgressions.length > 0;
    const hasStaminaChanges = summary.servantStaminaChanges.some(sc => sc.after !== sc.before);
    const hasAnyContent = hasCompletedTasks || hasProgressingTasks || hasStaminaChanges
        || summary.servantStaminaChanges.length > 0;

    const goldDelta = summary.goldAfter - summary.goldBefore;
    const manaDelta = summary.manaAfter - summary.manaBefore;
    const comfortDelta = summary.comfortAfter - summary.comfortBefore;
    const obedienceDelta = summary.obedienceAfter - summary.obedienceBefore;

    const servants = stage().currentState.servants;

    const fmtDelta = (v: number) => v > 0 ? `+${v}` : v < 0 ? `${v}` : '—';
    const deltaColor = (v: number) => v > 0 ? '#7dd4a0' : v < 0 ? '#c87d6e' : 'rgba(200,170,110,0.3)';

    return (
        <div className="ts-screen" onClick={phase < totalPhases ? skipToReady : undefined}>
            {/* Decorative border frame */}
            <div className="ts-frame">
                <div className="ts-frame-corner ts-tl" />
                <div className="ts-frame-corner ts-tr" />
                <div className="ts-frame-corner ts-bl" />
                <div className="ts-frame-corner ts-br" />
                <div className="ts-frame-edge ts-edge-top" />
                <div className="ts-frame-edge ts-edge-bottom" />

                {/* ═══ Header ═══ */}
                <div className={`ts-header ${phase >= 0 ? 'ts-visible' : ''}`}>
                    <div className="ts-header-icon">
                        <GameIcon icon="sunset" size={28} color="#e8c84a" />
                    </div>
                    <div className="ts-header-text">
                        <div className="ts-header-title">Day {summary.dayEnded}</div>
                        <div className="ts-header-sub">End of Day Report</div>
                    </div>
                    <div className="ts-header-divider" />
                </div>

                {/* ═══ Resource Ledger ═══ */}
                <div className={`ts-ledger ${phase >= 1 ? 'ts-visible' : ''}`}>
                    <div className="ts-ledger-row">
                        <LedgerCell
                            icon={<img src={GoldIcon} alt="" className="ts-res-icon" />}
                            label="Gold"
                            value={summary.goldAfter}
                            delta={goldDelta}
                        />
                        <div className="ts-ledger-sep" />
                        <LedgerCell
                            icon={<GameIcon icon="sparkles" size={16} color="#78a8d0" />}
                            label="Mana"
                            value={summary.manaAfter}
                            delta={manaDelta}
                        />
                        <div className="ts-ledger-sep" />
                        <LedgerCell
                            icon={<img src={ComfortIcon} alt="" className="ts-res-icon" />}
                            label="Comfort"
                            value={summary.comfortAfter}
                            delta={comfortDelta}
                        />
                        <div className="ts-ledger-sep" />
                        <LedgerCell
                            icon={<img src={ObedienceIcon} alt="" className="ts-res-icon" />}
                            label="Obedience"
                            value={summary.obedienceAfter}
                            delta={obedienceDelta}
                        />
                    </div>
                </div>

                {/* ═══ Tasks Section ═══ */}
                <div className={`ts-section ${phase >= 2 ? 'ts-visible' : ''}`}>
                    {hasCompletedTasks && (
                        <div className="ts-block">
                            <div className="ts-block-header">
                                <GameIcon icon="check-circle" size={13} color="#7dd4a0" />
                                <span>Tasks Completed</span>
                            </div>
                            <div className="ts-task-list">
                                {summary.completedTasks.map((ct, i) => (
                                    <TaskCard key={i} task={ct} servants={servants} />
                                ))}
                            </div>
                        </div>
                    )}

                    {hasProgressingTasks && (
                        <div className="ts-block">
                            <div className="ts-block-header">
                                <GameIcon icon="hourglass" size={13} color="#c8aa6e" />
                                <span>In Progress</span>
                            </div>
                            <div className="ts-progress-list">
                                {summary.taskProgressions.map((tp, i) => {
                                    const pct = Math.round(((tp.totalDuration - tp.turnsRemaining) / tp.totalDuration) * 100);
                                    const avatar = servants[tp.servantName]?.avatar;
                                    return (
                                        <div key={i} className="ts-prog-row">
                                            {avatar && <img src={avatar} alt="" className="ts-prog-avatar" />}
                                            <div className="ts-prog-info">
                                                <div className="ts-prog-names">
                                                    <span className="ts-prog-servant">{tp.servantName}</span>
                                                    <span className="ts-prog-dot">·</span>
                                                    <span className="ts-prog-task">{tp.taskName}</span>
                                                </div>
                                                <div className="ts-prog-bar">
                                                    <div className="ts-prog-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                            <span className="ts-prog-turns">
                                                {tp.turnsRemaining}<span className="ts-prog-unit"> turn{tp.turnsRemaining !== 1 ? 's' : ''}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ Servants Section ═══ */}
                <div className={`ts-section ${phase >= 3 ? 'ts-visible' : ''}`}>
                    {summary.servantStaminaChanges.length > 0 && (
                        <div className="ts-block">
                            <div className="ts-block-header">
                                <GameIcon icon="users" size={13} color="#a888c8" />
                                <span>Servant Status</span>
                            </div>
                            <div className="ts-servant-grid">
                                {summary.servantStaminaChanges.map((sc, i) => {
                                    const servant = servants[sc.name];
                                    const delta = sc.after - sc.before;
                                    const staminaColor = sc.after > 60 ? '#7dd4a0' : sc.after > 30 ? '#e8c84a' : '#c87d6e';
                                    return (
                                        <div key={i} className="ts-servant-card">
                                            <div className="ts-servant-portrait">
                                                {servant?.avatar ? (
                                                    <img src={servant.avatar} alt="" className="ts-servant-avatar" />
                                                ) : (
                                                    <div className="ts-servant-avatar-placeholder">
                                                        <GameIcon icon="user" size={16} />
                                                    </div>
                                                )}
                                                {!servant?.activeTask ? (
                                                    <div className="ts-badge ts-badge-idle">
                                                        <GameIcon icon="moon" size={7} />
                                                    </div>
                                                ) : (
                                                    <div className="ts-badge ts-badge-working">
                                                        <GameIcon icon="clock" size={7} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ts-servant-body">
                                                <span className="ts-servant-name">{sc.name}</span>
                                                <div className="ts-servant-stamina">
                                                    <div className="ts-stam-track">
                                                        <div
                                                            className="ts-stam-fill"
                                                            style={{
                                                                width: `${sc.after}%`,
                                                                background: `linear-gradient(90deg, ${staminaColor}88, ${staminaColor})`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="ts-stam-text">
                                                        {sc.after}%
                                                        {delta !== 0 && (
                                                            <span style={{ color: deltaColor(delta), marginLeft: 4 }}>
                                                                ({fmtDelta(delta)})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ Daily Events ═══ */}
                {summary.dailyEvents && summary.dailyEvents.length > 0 && (
                    <div className={`ts-section ${phase >= 3 ? 'ts-visible' : ''}`}>
                        <div className="ts-block">
                            <div className="ts-block-header">
                                <GameIcon icon="scroll" size={13} color="#d4a07a" />
                                <span>Events</span>
                            </div>
                            <div className="ts-event-list">
                                {summary.dailyEvents.map((ev, i) => (
                                    <div key={i} className="ts-event-card">
                                        <div className="ts-event-icon">
                                            <GameIcon icon={ev.icon} size={16} color="#d4a07a" />
                                        </div>
                                        <div className="ts-event-body">
                                            <span className="ts-event-name">{ev.name}</span>
                                            <span className="ts-event-desc">{ev.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Quiet day ═══ */}
                {!hasCompletedTasks && !hasProgressingTasks && (!summary.dailyEvents || summary.dailyEvents.length === 0) && phase >= 2 && (
                    <div className="ts-empty">
                        <GameIcon icon="moon" size={28} color="rgba(200,170,110,0.25)" />
                        <p>A quiet day at the manor.</p>
                        <p className="ts-empty-hint">Assign tasks to your servants for more productive days.</p>
                    </div>
                )}

                {/* ═══ Continue Button ═══ */}
                <div className={`ts-footer ${phase >= totalPhases ? 'ts-visible' : ''}`}>
                    <button className="ts-continue-btn" onClick={onContinue}>
                        <GameIcon icon="sunrise" size={16} />
                        <span>Begin Day {summary.dayStarting}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/** Resource ledger cell */
const LedgerCell: FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    delta: number;
}> = ({ icon, label, value, delta }) => {
    const dColor = delta > 0 ? '#7dd4a0' : delta < 0 ? '#c87d6e' : 'rgba(200,170,110,0.3)';
    const dText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—';
    return (
        <div className="ts-ledger-cell">
            <div className="ts-ledger-icon">{icon}</div>
            <span className="ts-ledger-val">{value}</span>
            <span className="ts-ledger-label">{label}</span>
            <span className="ts-ledger-delta" style={{ color: dColor }}>{dText}</span>
        </div>
    );
};

/** Completed task card */
const TaskCard: FC<{ task: TurnTaskResult; servants: Record<string, any> }> = ({ task, servants }) => {
    const servant = servants[task.servantName];
    const qColor = QUALITY_COLORS[task.quality] || '#c8aa6e';

    return (
        <div className="ts-task-card" style={{ borderLeftColor: qColor }}>
            <div className="ts-task-top">
                {servant?.avatar && <img src={servant.avatar} alt="" className="ts-task-avatar" />}
                <div className="ts-task-info">
                    <span className="ts-task-servant">{task.servantName}</span>
                    <span className="ts-task-name">{task.taskName}</span>
                </div>
                <div className="ts-task-quality" style={{ color: qColor, borderColor: `${qColor}55` }}>
                    {QUALITY_LABELS[task.quality]}
                </div>
            </div>
            {task.rewards.length > 0 && (
                <div className="ts-task-rewards">
                    {task.rewards.map((r, j) => (
                        <div key={j} className="ts-reward-pill">
                            {r.type === 'gold' && <GameIcon icon="coins" size={10} color="#e8c84a" />}
                            {r.type === 'mana' && <GameIcon icon="sparkles" size={10} color="#78a8d0" />}
                            {r.type === 'item' && <GameIcon icon="package" size={10} color="#a888c8" />}
                            {r.type === 'household' && <GameIcon icon="home" size={10} color="#7ab87a" />}
                            {r.type === 'stat' && <GameIcon icon="trending-up" size={10} color="#c8aa6e" />}
                            <span className="ts-reward-text">
                                {r.type === 'item' ? `${r.itemName} x${r.amount}` : `+${r.amount}`}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
