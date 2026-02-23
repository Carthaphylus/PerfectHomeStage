import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import {
    Stage, Servant, Role, getRoleById, ROOM_ROLES, STAT_DEFINITIONS, numberToGrade, getGradeColor,
    TaskDefinition, TaskOutcome, TaskCategory,
    getTaskById, getTaskCategoryLabel, getTaskCategoryIcon,
    getRoomTypeLabel, checkTaskRequirements, getApplicableTraitModifiers,
} from '../Stage';
import { CharacterProfile } from './CharacterProfile';
import { TraitChip } from './TraitChip';
import { GameIcon } from './GameIcon';
import { CharacterEditor } from './CharacterEditor';

interface ServantsScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    startScene: (participants: string[], location: string) => void;
    startServantChat: (servantName: string, location: string) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType, startScene, startServantChat }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleTarget, setRoleTarget] = useState<Servant | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTarget, setTaskTarget] = useState<Servant | null>(null);
    const [lastTaskOutcome, setLastTaskOutcome] = useState<{ servantName: string; outcome: TaskOutcome } | null>(null);
    const [, forceUpdate] = useState(0);

    const handleStartChat = (servant: Servant) => {
        const location = stage().currentState.location;
        startServantChat(servant.name, location);
    };

    const openRoleModal = (servant: Servant) => {
        setRoleTarget(servant);
        setShowRoleModal(true);
    };

    const handleAssignRole = (roleId: string) => {
        if (roleTarget) {
            stage().assignRole(roleTarget.name, roleId);
            // Refresh local reference
            const updated = stage().currentState.servants[roleTarget.name];
            if (updated) {
                setRoleTarget({ ...updated });
                if (selectedServant?.name === updated.name) {
                    setSelectedServant({ ...updated });
                }
            }
        }
        setShowRoleModal(false);
    };

    const handleUnassignRole = (servant: Servant) => {
        stage().unassignRole(servant.name);
        const updated = stage().currentState.servants[servant.name];
        if (updated) {
            if (selectedServant?.name === updated.name) {
                setSelectedServant({ ...updated });
            }
        }
    };

    // ── Task handlers ──
    const openTaskModal = (servant: Servant) => {
        setTaskTarget(servant);
        setShowTaskModal(true);
    };

    const handleAssignTask = (taskId: string) => {
        if (taskTarget) {
            const result = stage().assignTask(taskTarget.name, taskId);
            if (result.success) {
                const updated = stage().currentState.servants[taskTarget.name];
                if (updated) {
                    setTaskTarget({ ...updated });
                    if (selectedServant?.name === updated.name) {
                        setSelectedServant({ ...updated });
                    }
                }
                setShowTaskModal(false);
            }
        }
    };

    const handleCancelTask = (servant: Servant) => {
        stage().cancelTask(servant.name);
        const updated = stage().currentState.servants[servant.name];
        if (updated) {
            if (selectedServant?.name === updated.name) {
                setSelectedServant({ ...updated });
            }
        }
    };

    const handleDebugCompleteTask = (servant: Servant) => {
        const outcome = stage().debugCompleteTask(servant.name);
        if (outcome) {
            setLastTaskOutcome({ servantName: servant.name, outcome });
            const updated = stage().currentState.servants[servant.name];
            if (updated) {
                if (selectedServant?.name === updated.name) {
                    setSelectedServant({ ...updated });
                }
            }
        }
    };

    const dismissOutcome = () => setLastTaskOutcome(null);

    // Full profile view when a servant is selected
    if (selectedServant) {
        const s = selectedServant;
        const currentRole = s.assignedRole ? getRoleById(s.assignedRole) : undefined;

        return (
            <>
                <CharacterProfile
                    stage={stage}
                    character={{
                        name: s.name,
                        avatar: s.avatar,
                        color: s.color,
                        title: s.servantTitle || s.formerClass,
                        description: s.description,
                        traits: s.traits,
                        details: s.details,
                        stats: s.stats || { prowess: 50, expertise: 50, attunement: 50, presence: 50, discipline: 50, insight: 50 },
                    }}
                    onBack={() => setSelectedServant(null)}
                    archetypeTraits={s.archetypeTraits}
                    titleColor={s.servantTitleColor}
                    statusBadge={currentRole && (
                        <div className="char-role-badge" style={{ 
                            borderColor: currentRole.color,
                            color: currentRole.color,
                        }}>
                            <GameIcon icon={currentRole.icon} size={12} /> {currentRole.name}
                        </div>
                    )}
                    assignedRole={currentRole ? {
                        name: currentRole.name,
                        color: currentRole.color,
                        traits: currentRole.traits,
                    } : undefined}
                    extraActions={
                        <>
                            <button className="gallery-open-btn chat-btn" onClick={() => handleStartChat(s)}>
                                <GameIcon icon="message-circle" size={12} /> Chat
                            </button>
                            <button
                                className="gallery-open-btn role-btn"
                                onClick={() => openRoleModal(s)}
                            >
                                {currentRole ? <><GameIcon icon={currentRole.icon} size={12} /> Change Role</> : <><GameIcon icon="clipboard-list" size={12} /> Assign Role</>}
                            </button>
                        </>
                    }
                    extraSections={
                        <div className="char-bio-section service-panel">
                            <h4>Service</h4>

                            {/* ── Stat gauges ── */}
                            <div className="service-gauges">
                                <div className="service-gauge love-gauge">
                                    <div className="service-gauge-header">
                                        <span className="service-gauge-icon">♥</span>
                                        <span className="service-gauge-label">Love</span>
                                        <span className="service-gauge-value">{s.love}<small>%</small></span>
                                    </div>
                                    <div className="service-gauge-track">
                                        <div className="service-gauge-fill" style={{ width: `${s.love}%` }} />
                                        <div className="service-gauge-glow" style={{ width: `${s.love}%` }} />
                                    </div>
                                </div>
                                <div className="service-gauge obedience-gauge">
                                    <div className="service-gauge-header">
                                        <span className="service-gauge-icon">⛓</span>
                                        <span className="service-gauge-label">Obedience</span>
                                        <span className="service-gauge-value">{s.obedience}<small>%</small></span>
                                    </div>
                                    <div className="service-gauge-track">
                                        <div className="service-gauge-fill" style={{ width: `${s.obedience}%` }} />
                                        <div className="service-gauge-glow" style={{ width: `${s.obedience}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Conditioning seal ── */}
                            <div className="service-conditioned-seal">
                                <span className="seal-ornament left">◆</span>
                                <GameIcon icon="orbit" size={14} className="seal-icon" />
                                <span className="seal-text">Fully Conditioned</span>
                                <span className="seal-ornament right">◆</span>
                            </div>

                            {/* ── Role card ── */}
                            {currentRole && (
                                <div className="service-role-card" style={{ '--role-color': currentRole.color } as React.CSSProperties}>
                                    <div className="service-role-header">
                                        <div className="service-role-identity">
                                            <span className="service-role-icon"><GameIcon icon={currentRole.icon} size={18} /></span>
                                            <div className="service-role-title">
                                                <span className="service-role-label">Assigned Role</span>
                                                <span className="service-role-name">{currentRole.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="service-role-remove"
                                            onClick={() => handleUnassignRole(s)}
                                            title="Remove Role"
                                        >✕</button>
                                    </div>

                                    {currentRole.buffs.length > 0 && (
                                        <div className="service-role-buffs">
                                            <span className="service-role-buffs-label">Buffs</span>
                                            <div className="service-role-buff-list">
                                                {currentRole.buffs.map((buff, i) => (
                                                    <div key={i} className="service-role-buff">{buff.label}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentRole.traits.length > 0 && (
                                        <div className="service-role-traits">
                                            <span className="service-role-traits-label">Granted Traits</span>
                                            <div className="service-role-traits-list">
                                                {currentRole.traits.map((trait, index) => (
                                                    <TraitChip
                                                        key={`${trait}-${index}`}
                                                        trait={trait}
                                                        className="char-trait char-trait-role"
                                                        color={currentRole.color}
                                                        source="room"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Active Task / Task Assignment ── */}
                            {s.activeTask ? (() => {
                                const taskDef = getTaskById(s.activeTask!.definitionId);
                                if (!taskDef) return null;
                                const progress = ((s.activeTask!.totalDuration - s.activeTask!.turnsRemaining) / s.activeTask!.totalDuration) * 100;
                                return (
                                    <div className="service-task-card" style={{ '--task-color': taskDef.color } as React.CSSProperties}>
                                        <div className="service-task-header">
                                            <div className="service-task-identity">
                                                <span className="service-task-icon"><GameIcon icon={taskDef.icon} size={18} /></span>
                                                <div className="service-task-title">
                                                    <span className="service-task-label">Active Task</span>
                                                    <span className="service-task-name">{taskDef.name}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="service-task-cancel"
                                                onClick={() => handleCancelTask(s)}
                                                title="Cancel Task"
                                            >✕</button>
                                        </div>
                                        <div className="service-task-progress">
                                            <div className="service-task-progress-track">
                                                <div className="service-task-progress-fill" style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="service-task-progress-label">
                                                {s.activeTask!.turnsRemaining} turn{s.activeTask!.turnsRemaining !== 1 ? 's' : ''} remaining
                                            </span>
                                        </div>
                                        <button
                                            className="service-task-debug-btn"
                                            onClick={() => handleDebugCompleteTask(s)}
                                            title="Debug: Complete task immediately"
                                        >
                                            <GameIcon icon="wrench" size={12} /> Complete Now (Debug)
                                        </button>
                                    </div>
                                );
                            })() : (
                                <button
                                    className="service-task-assign-btn"
                                    onClick={() => openTaskModal(s)}
                                >
                                    <GameIcon icon="list-todo" size={14} /> Assign Task
                                </button>
                            )}

                            <CharacterEditor stage={stage} characterName={s.name} style={{ marginTop: '8px' }} onChange={() => forceUpdate(n => n + 1)} />
                        </div>
                    }
                />

                {/* Role picker overlay (profile context) */}
                {showRoleModal && roleTarget && (
                    <RoleAssignmentModal
                        stage={stage}
                        target={roleTarget}
                        onAssign={handleAssignRole}
                        onClose={() => setShowRoleModal(false)}
                    />
                )}

                {/* Task picker overlay (profile context) */}
                {showTaskModal && taskTarget && (
                    <TaskAssignmentModal
                        stage={stage}
                        target={taskTarget}
                        onAssign={handleAssignTask}
                        onClose={() => setShowTaskModal(false)}
                    />
                )}

                {/* Task outcome overlay */}
                {lastTaskOutcome && (
                    <TaskOutcomeOverlay
                        outcome={lastTaskOutcome.outcome}
                        servantName={lastTaskOutcome.servantName}
                        onDismiss={dismissOutcome}
                    />
                )}
            </>
        );
    }

    // Card grid view
    return (
        <div className="servants-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Servants</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="servants-content">
                <div className="servants-grid">
                    {servants.length === 0 ? (
                        <div className="empty-message">No servants yet...</div>
                    ) : (
                        servants.map((servant) => {
                            const role = servant.assignedRole ? getRoleById(servant.assignedRole) : undefined;
                            const subtitleColor = role ? role.color : servant.servantTitleColor || undefined;
                            const subtitleText = role ? undefined : (servant.servantTitle || servant.formerClass);
                            return (
                                <div 
                                    key={servant.name} 
                                    className="servant-card"
                                    style={{ '--char-color': servant.color } as React.CSSProperties}
                                    onClick={() => setSelectedServant(servant)}
                                >
                                    <div className="servant-card-avatar">
                                        <img src={servant.avatar} alt={servant.name} />
                                    </div>
                                    <div className="servant-card-info">
                                        <span className="servant-card-name">{servant.name}</span>
                                        <span
                                            className={`servant-card-class ${role ? 'has-role' : ''}`}
                                            style={subtitleColor ? { color: subtitleColor } as React.CSSProperties : undefined}
                                            onClick={role ? (e) => { e.stopPropagation(); openRoleModal(servant); } : undefined}
                                            title={role ? `Role: ${role.name} — click to change` : undefined}
                                        >
                                            {role ? <><GameIcon icon={role.icon} size={10} /> {role.name}</> : subtitleText}
                                        </span>
                                    </div>

                                    {/* Assign role button only when no role */}
                                    {!role && (
                                        <button
                                            className="servant-assign-btn"
                                            onClick={(e) => { e.stopPropagation(); openRoleModal(servant); }}
                                            title="Assign a role"
                                        >
                                            <GameIcon icon="clipboard-list" size={12} /> Assign Role
                                        </button>
                                    )}

                                    <div className="servant-card-bars">
                                        <div className="servant-mini-bar love-bar">
                                            <span className="servant-mini-bar-label"><GameIcon icon="heart" size={10} className="icon-red" /></span>
                                            <div className="servant-mini-bar-track">
                                                <div className="servant-mini-bar-fill" style={{ width: `${servant.love}%` }} />
                                            </div>
                                        </div>
                                        <div className="servant-mini-bar obedience-bar">
                                            <span className="servant-mini-bar-label"><GameIcon icon="link" size={10} className="icon-purple" /></span>
                                            <div className="servant-mini-bar-track">
                                                <div className="servant-mini-bar-fill" style={{ width: `${servant.obedience}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="servant-chat-btn"
                                        onClick={(e) => { e.stopPropagation(); handleStartChat(servant); }}
                                        title={`Chat with ${servant.name}`}
                                    >
                                        <GameIcon icon="message-circle" size={12} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Role picker overlay (grid context) */}
            {showRoleModal && roleTarget && (
                <RoleAssignmentModal
                    stage={stage}
                    target={roleTarget}
                    onAssign={handleAssignRole}
                    onClose={() => setShowRoleModal(false)}
                />
            )}

            {/* Task picker overlay (grid context) */}
            {showTaskModal && taskTarget && (
                <TaskAssignmentModal
                    stage={stage}
                    target={taskTarget}
                    onAssign={handleAssignTask}
                    onClose={() => setShowTaskModal(false)}
                />
            )}

            {/* Task outcome overlay (grid context) */}
            {lastTaskOutcome && (
                <TaskOutcomeOverlay
                    outcome={lastTaskOutcome.outcome}
                    servantName={lastTaskOutcome.servantName}
                    onDismiss={dismissOutcome}
                />
            )}
        </div>
    );
};


// ============================================================================
// Role Assignment Modal
// ============================================================================

interface RoleAssignmentModalProps {
    stage: () => Stage;
    target: Servant;
    onAssign: (roleId: string) => void;
    onClose: () => void;
}

const RoleAssignmentModal: FC<RoleAssignmentModalProps> = ({ stage, target, onAssign, onClose }) => {
    const [previewRole, setPreviewRole] = useState<Role | null>(null);

    // Get available roles (universal + rooms that exist in the manor)
    const availableRoles = stage().getAvailableRolesForManor();
    const allServants = stage().currentState.servants;

    // Group roles: universal first, then by room type
    const universalRoles = availableRoles.filter(r => r.roomType === null);
    const roomRoles = availableRoles.filter(r => r.roomType !== null);

    // Group room roles by roomType
    const roomGroups: Record<string, Role[]> = {};
    for (const role of roomRoles) {
        const key = role.roomType!;
        if (!roomGroups[key]) roomGroups[key] = [];
        roomGroups[key].push(role);
    }

    // Pretty room type name
    const roomLabel = (type: string): string => {
        const labels: Record<string, string> = {
            kitchen: 'Kitchen', brewing: 'Brewing Room', classroom: 'Classroom',
            quarters: 'Servant Quarters', ritual: 'Ritual Room', storage: 'Storage',
            stable: 'Stable', dungeon: 'Dungeon', cell: 'Cell', lounge: 'Lounge',
        };
        return labels[type] || type;
    };

    const renderRoleRow = (role: Role) => {
        const holders = Object.values(allServants).filter(s => s.assignedRole === role.id);
        const isCurrentTarget = holders.some(h => h.name === target.name);
        const otherHolders = holders.filter(h => h.name !== target.name);

        // For unique roles: show the single holder (if any)
        // For non-unique roles: show count of other holders
        let holderLabel: string | null = null;
        if (isCurrentTarget) {
            holderLabel = '(current)';
        } else if (role.unique && otherHolders.length > 0) {
            holderLabel = `${otherHolders[0].name}`;
        } else if (!role.unique && otherHolders.length > 0) {
            holderLabel = `${otherHolders.length} assigned`;
        }

        // Button label
        let btnLabel: string | JSX.Element = 'Assign';
        if (isCurrentTarget) {
            btnLabel = <GameIcon icon="check" size={12} />;
        } else if (role.unique && otherHolders.length > 0) {
            btnLabel = 'Replace';
        }

        return (
            <div
                key={role.id}
                className={`role-row ${previewRole?.id === role.id ? 'previewing' : ''} ${isCurrentTarget ? 'current' : ''}`}
                onClick={() => setPreviewRole(role)}
            >
                <span className="role-row-icon"><GameIcon icon={role.icon} size={16} /></span>
                <div className="role-row-info">
                    <span className="role-row-name" style={{ color: role.color }}>
                        {role.name}
                        {!role.unique && <span className="role-row-multi-badge" title="Multiple servants can hold this role"><GameIcon icon="infinity" size={10} /></span>}
                    </span>
                    {holderLabel && (
                        <span className={`role-row-holder ${isCurrentTarget ? 'self' : 'other'}`}>
                            {holderLabel}
                        </span>
                    )}
                </div>
                <button
                    className="role-row-assign-btn"
                    onClick={(e) => { e.stopPropagation(); onAssign(role.id); }}
                >
                    {btnLabel}
                </button>
            </div>
        );
    };

    return (
        <div className="role-modal-overlay" onClick={onClose}>
            <div className="role-modal" onClick={e => e.stopPropagation()}>
                <div className="role-modal-header">
                    <h3>Assign Role — {target.name}</h3>
                    <button className="role-modal-close" onClick={onClose}><GameIcon icon="x" size={14} /></button>
                </div>

                <div className="role-modal-body">
                    {/* Left: role list */}
                    <div className="role-list">
                        <div className="role-group">
                            <div className="role-group-header">Universal</div>
                            {universalRoles.map(renderRoleRow)}
                        </div>

                        {Object.entries(roomGroups).map(([roomType, roles]) => (
                            <div key={roomType} className="role-group">
                                <div className="role-group-header">{roomLabel(roomType)}</div>
                                {roles.map(renderRoleRow)}
                            </div>
                        ))}
                    </div>

                    {/* Right: role preview */}
                    <div className="role-preview">
                        {previewRole ? (
                            <>
                                <div className="role-preview-icon"><GameIcon icon={previewRole.icon} size={24} /></div>
                                <h4 className="role-preview-name" style={{ color: previewRole.color }}>{previewRole.name}</h4>
                                <span className={`role-preview-uniqueness ${previewRole.unique ? 'unique' : 'shared'}`}>
                                    {previewRole.unique ? <><GameIcon icon="lock" size={12} /> Unique Role</> : <><GameIcon icon="infinity" size={12} /> Shared Role</>}
                                </span>
                                <p className="role-preview-desc">{previewRole.description}</p>

                                <div className="role-preview-section">
                                    <h5>Buffs</h5>
                                    {previewRole.buffs.map((b, i) => (
                                        <div key={i} className="role-preview-buff">{b.label}</div>
                                    ))}
                                </div>

                                {previewRole.traits.length > 0 && (
                                    <div className="role-preview-section">
                                        <h5>Granted Traits</h5>
                                        <div className="role-preview-traits">
                                            {previewRole.traits.map((t, i) => (
                                                <TraitChip
                                                    key={i}
                                                    trait={t}
                                                    className="role-preview-trait"
                                                    color={previewRole.color}
                                                    source="room"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewRole.roomType && (
                                    <div className="role-preview-room">
                                        <GameIcon icon="map-pin" size={12} /> {roomLabel(previewRole.roomType)}
                                    </div>
                                )}

                                {/* Show current holders for non-unique roles */}
                                {!previewRole.unique && (() => {
                                    const holders = Object.values(allServants).filter(s => s.assignedRole === previewRole.id);
                                    return holders.length > 0 ? (
                                        <div className="role-preview-section">
                                            <h5>Currently Assigned ({holders.length})</h5>
                                            {holders.map(h => (
                                                <div key={h.name} className="role-preview-holder">
                                                    <img src={h.avatar} alt={h.name} className="role-holder-avatar" />
                                                    <span>{h.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;
                                })()}

                                <button
                                    className="role-preview-assign-btn"
                                    onClick={() => onAssign(previewRole.id)}
                                >
                                    Assign {previewRole.name} to {target.name}
                                </button>
                            </>
                        ) : (
                            <div className="role-preview-empty">
                                <div className="role-preview-empty-icon"><GameIcon icon="clipboard-list" size={24} className="icon-muted" /></div>
                                <p>Select a role to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// ============================================================================
// Task Assignment Modal
// ============================================================================

interface TaskAssignmentModalProps {
    stage: () => Stage;
    target: Servant;
    onAssign: (taskId: string) => void;
    onClose: () => void;
}

const TaskAssignmentModal: FC<TaskAssignmentModalProps> = ({ stage, target, onAssign, onClose }) => {
    const [previewTask, setPreviewTask] = useState<TaskDefinition | null>(null);
    const [searchFilter, setSearchFilter] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    // Get available tasks
    const availableTasks = stage().getAvailableTasksForServantByName(target.name);

    // Filter by search
    const filteredTasks = searchFilter
        ? availableTasks.filter(t =>
            t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            t.description.toLowerCase().includes(searchFilter.toLowerCase())
        )
        : availableTasks;

    // Group by category
    const categoryOrder: TaskCategory[] = ['room', 'exploration', 'training', 'upkeep', 'personal'];
    const groups: Record<string, TaskDefinition[]> = {};
    for (const task of filteredTasks) {
        if (!groups[task.category]) groups[task.category] = [];
        groups[task.category].push(task);
    }

    const toggleCategory = (cat: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const renderTaskRow = (task: TaskDefinition) => {
        const reqCheck = checkTaskRequirements(target, task);
        const isDisabled = !reqCheck.met;
        const hasActiveTask = !!target.activeTask;

        return (
            <div
                key={task.id}
                className={`task-row ${previewTask?.id === task.id ? 'previewing' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => setPreviewTask(task)}
            >
                <span className="task-row-icon" style={{ color: task.color }}><GameIcon icon={task.icon} size={16} /></span>
                <div className="task-row-info">
                    <span className="task-row-name" style={{ color: isDisabled ? undefined : task.color }}>
                        {task.name}
                    </span>
                    <span className="task-row-meta">
                        <GameIcon icon="clock" size={10} /> {task.duration} turn{task.duration !== 1 ? 's' : ''}
                        {task.manaCost ? <> · <GameIcon icon="sparkles" size={10} /> {task.manaCost} mana</> : null}
                    </span>
                </div>
                <button
                    className="task-row-assign-btn"
                    disabled={isDisabled || hasActiveTask}
                    onClick={(e) => { e.stopPropagation(); if (!isDisabled && !hasActiveTask) onAssign(task.id); }}
                >
                    {hasActiveTask ? 'Busy' : isDisabled ? 'Locked' : 'Assign'}
                </button>
            </div>
        );
    };

    // Preview panel helpers
    const previewReqCheck = previewTask ? checkTaskRequirements(target, previewTask) : null;
    const previewTraitMods = previewTask ? getApplicableTraitModifiers(target, previewTask) : [];
    const previewQuality = previewTask ? stage().calculateTaskQuality(target, previewTask) : null;

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal" onClick={e => e.stopPropagation()}>
                <div className="task-modal-header">
                    <h3>Assign Task — {target.name}</h3>
                    <div className="task-modal-search">
                        <GameIcon icon="search" size={12} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchFilter}
                            onChange={e => setSearchFilter(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <button className="task-modal-close" onClick={onClose}><GameIcon icon="x" size={14} /></button>
                </div>

                <div className="task-modal-body">
                    {/* Left: task list */}
                    <div className="task-list">
                        {categoryOrder.map(cat => {
                            const tasksInCat = groups[cat];
                            if (!tasksInCat || tasksInCat.length === 0) return null;
                            const isCollapsed = collapsedCategories.has(cat);

                            return (
                                <div key={cat} className="task-group">
                                    <div
                                        className="task-group-header"
                                        onClick={() => toggleCategory(cat)}
                                    >
                                        <GameIcon icon={getTaskCategoryIcon(cat as TaskCategory)} size={12} />
                                        <span>{getTaskCategoryLabel(cat as TaskCategory)}</span>
                                        <span className="task-group-count">{tasksInCat.length}</span>
                                        <GameIcon icon={isCollapsed ? 'chevron-right' : 'chevron-down'} size={12} className="task-group-chevron" />
                                    </div>
                                    {!isCollapsed && tasksInCat.map(renderTaskRow)}
                                </div>
                            );
                        })}

                        {filteredTasks.length === 0 && (
                            <div className="task-list-empty">
                                <p>No tasks match your search</p>
                            </div>
                        )}
                    </div>

                    {/* Right: task preview */}
                    <div className="task-preview">
                        {previewTask ? (
                            <>
                                <div className="task-preview-icon" style={{ color: previewTask.color }}>
                                    <GameIcon icon={previewTask.icon} size={28} />
                                </div>
                                <h4 className="task-preview-name" style={{ color: previewTask.color }}>
                                    {previewTask.name}
                                </h4>
                                <span className="task-preview-category">
                                    <GameIcon icon={getTaskCategoryIcon(previewTask.category)} size={11} />
                                    {getTaskCategoryLabel(previewTask.category)}
                                    {previewTask.roomType && <> · {getRoomTypeLabel(previewTask.roomType)}</>}
                                    {previewTask.location && <> · {previewTask.location}</>}
                                </span>
                                <p className="task-preview-desc">{previewTask.description}</p>

                                {/* Duration & cost */}
                                <div className="task-preview-meta">
                                    <div className="task-preview-meta-item">
                                        <GameIcon icon="clock" size={12} />
                                        <span>{previewTask.duration} turn{previewTask.duration !== 1 ? 's' : ''}</span>
                                    </div>
                                    {previewTask.manaCost ? (
                                        <div className="task-preview-meta-item mana">
                                            <GameIcon icon="sparkles" size={12} />
                                            <span>{previewTask.manaCost} mana</span>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Requirements */}
                                {previewTask.requirements.length > 0 && (
                                    <div className="task-preview-section">
                                        <h5>Requirements</h5>
                                        {previewTask.requirements.map((req, i) => {
                                            const current = target.stats[req.stat] ?? 0;
                                            const met = current >= req.minimum;
                                            return (
                                                <div key={i} className={`task-preview-req ${met ? 'met' : 'unmet'}`}>
                                                    <span className="task-req-icon">{met ? '✓' : '✗'}</span>
                                                    <span className="task-req-stat">{req.stat}</span>
                                                    <span className="task-req-values">{current} / {req.minimum}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Trait modifiers on this servant */}
                                {previewTask.traitModifiers.length > 0 && (
                                    <div className="task-preview-section">
                                        <h5>Trait Effects</h5>
                                        {previewTask.traitModifiers.map((mod, i) => {
                                            const isActive = previewTraitMods.some(a => a.modifier.traitKey === mod.traitKey);
                                            return (
                                                <div key={i} className={`task-preview-trait-mod ${isActive ? 'active' : 'inactive'} ${mod.effect}`}>
                                                    <span className="task-trait-indicator">{mod.effect === 'bonus' ? '+' : '−'}</span>
                                                    <span className="task-trait-name">{mod.traitKey}</span>
                                                    <span className="task-trait-desc">{mod.description}</span>
                                                    {isActive && <span className="task-trait-active-badge">Active</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Expected rewards */}
                                <div className="task-preview-section">
                                    <h5>Rewards</h5>
                                    {previewTask.rewards.map((reward, i) => (
                                        <div key={i} className="task-preview-reward">
                                            <span className="task-reward-icon">
                                                {reward.type === 'gold' && <GameIcon icon="coins" size={12} />}
                                                {reward.type === 'mana' && <GameIcon icon="sparkles" size={12} />}
                                                {reward.type === 'item' && <GameIcon icon="package" size={12} />}
                                                {reward.type === 'stat' && <GameIcon icon="trending-up" size={12} />}
                                                {reward.type === 'household' && <GameIcon icon="building" size={12} />}
                                            </span>
                                            <span className="task-reward-text">
                                                {reward.type === 'gold' && `${reward.amount} Gold`}
                                                {reward.type === 'mana' && `${reward.amount} Mana`}
                                                {reward.type === 'item' && `${reward.amount}× ${reward.itemName}`}
                                                {reward.type === 'stat' && `+${reward.amount} ${reward.stat}`}
                                                {reward.type === 'household' && `+${reward.amount} ${reward.stat}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Expected quality */}
                                <div className="task-preview-quality">
                                    <span className="task-quality-label">Expected Quality</span>
                                    <span className={`task-quality-badge quality-${previewQuality}`}>
                                        {previewQuality === 'excellent' ? '★★★ Excellent' : previewQuality === 'standard' ? '★★ Standard' : '★ Poor'}
                                    </span>
                                </div>

                                {/* Role bonus */}
                                {previewTask.roleBonus && (
                                    <div className="task-preview-role-bonus">
                                        <GameIcon icon="shield-plus" size={12} />
                                        <span>
                                            Role bonus: {(() => {
                                                const role = getRoleById(previewTask.roleBonus!);
                                                const hasBonus = target.assignedRole === previewTask.roleBonus;
                                                return role ? (
                                                    <span className={hasBonus ? 'bonus-active' : 'bonus-inactive'}>
                                                        {role.name} {hasBonus ? '(active)' : '(not assigned)'}
                                                    </span>
                                                ) : null;
                                            })()}
                                        </span>
                                    </div>
                                )}

                                <button
                                    className="task-preview-assign-btn"
                                    disabled={!previewReqCheck?.met || !!target.activeTask}
                                    onClick={() => onAssign(previewTask.id)}
                                >
                                    {target.activeTask ? 'Already on a Task' :
                                     !previewReqCheck?.met ? 'Requirements Not Met' :
                                     `Assign ${previewTask.name} to ${target.name}`}
                                </button>
                            </>
                        ) : (
                            <div className="task-preview-empty">
                                <div className="task-preview-empty-icon"><GameIcon icon="list-todo" size={24} className="icon-muted" /></div>
                                <p>Select a task to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// ============================================================================
// Task Outcome Overlay
// ============================================================================

interface TaskOutcomeOverlayProps {
    outcome: TaskOutcome;
    servantName: string;
    onDismiss: () => void;
}

const TaskOutcomeOverlay: FC<TaskOutcomeOverlayProps> = ({ outcome, servantName, onDismiss }) => {
    const qualityColors = { excellent: '#d4a040', standard: '#78a8d0', poor: '#a06060' };
    const qualityLabels = { excellent: '★★★ Excellent', standard: '★★ Standard', poor: '★ Poor' };

    return (
        <div className="task-outcome-overlay" onClick={onDismiss}>
            <div className="task-outcome-panel" onClick={e => e.stopPropagation()}>
                <div className="task-outcome-header">
                    <h3>Task Complete</h3>
                    <span className="task-outcome-servant">{servantName}</span>
                </div>

                <div className="task-outcome-quality" style={{ '--quality-color': qualityColors[outcome.quality] } as React.CSSProperties}>
                    <span className={`task-outcome-quality-badge quality-${outcome.quality}`}>
                        {qualityLabels[outcome.quality]}
                    </span>
                </div>

                <div className="task-outcome-rewards">
                    <h4>Rewards Earned</h4>
                    {outcome.rewards.map((reward, i) => (
                        <div key={i} className="task-outcome-reward-row">
                            <span className="task-outcome-reward-icon">
                                {reward.type === 'gold' && <GameIcon icon="coins" size={14} />}
                                {reward.type === 'mana' && <GameIcon icon="sparkles" size={14} />}
                                {reward.type === 'item' && <GameIcon icon="package" size={14} />}
                                {reward.type === 'stat' && <GameIcon icon="trending-up" size={14} />}
                                {reward.type === 'household' && <GameIcon icon="building" size={14} />}
                            </span>
                            <span className="task-outcome-reward-text">
                                {reward.type === 'gold' && `+${reward.amount} Gold`}
                                {reward.type === 'mana' && `+${reward.amount} Mana`}
                                {reward.type === 'item' && `+${reward.amount}× ${reward.itemName}`}
                                {reward.type === 'stat' && `+${reward.amount} ${reward.stat}`}
                                {reward.type === 'household' && `+${reward.amount} ${reward.stat}`}
                            </span>
                            {reward.narrative && <span className="task-outcome-reward-narrative">{reward.narrative}</span>}
                        </div>
                    ))}
                </div>

                <button className="task-outcome-dismiss" onClick={onDismiss}>
                    Continue
                </button>
            </div>
        </div>
    );
};
