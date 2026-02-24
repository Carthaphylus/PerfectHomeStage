import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import {
    Stage, Servant, Role, getRoleById, ROOM_ROLES, STAT_DEFINITIONS, numberToGrade, getGradeColor,
    TaskDefinition, TaskOutcome, TaskCategory, TaskReward,
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
    startMultiServantChat: (servantNames: string[], location: string) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType, startScene, startServantChat, startMultiServantChat }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleTarget, setRoleTarget] = useState<Servant | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTarget, setTaskTarget] = useState<Servant | null>(null);
    const [lastTaskOutcome, setLastTaskOutcome] = useState<{ servantName: string; outcome: TaskOutcome } | null>(null);
    const [, forceUpdate] = useState(0);

    // Multi-chat selection state
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

    const handleStartChat = (servant: Servant) => {
        const location = stage().currentState.location;
        startServantChat(servant.name, location);
    };

    const toggleMultiSelect = (servantName: string) => {
        setMultiSelected(prev => {
            const next = new Set(prev);
            if (next.has(servantName)) {
                next.delete(servantName);
            } else {
                next.add(servantName);
            }
            return next;
        });
    };

    const handleStartMultiChat = () => {
        if (multiSelected.size < 2) return;
        startMultiServantChat(Array.from(multiSelected), 'Manor');
        setMultiSelectMode(false);
        setMultiSelected(new Set());
    };

    const cancelMultiSelect = () => {
        setMultiSelectMode(false);
        setMultiSelected(new Set());
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
                                <div className="service-gauge stamina-gauge">
                                    <div className="service-gauge-header">
                                        <span className="service-gauge-icon">⚡</span>
                                        <span className="service-gauge-label">Stamina</span>
                                        <span className="service-gauge-value">{s.stamina ?? 100}<small>/{s.maxStamina ?? 100}</small></span>
                                    </div>
                                    <div className="service-gauge-track">
                                        <div className="service-gauge-fill" style={{ width: `${((s.stamina ?? 100) / (s.maxStamina ?? 100)) * 100}%` }} />
                                        <div className="service-gauge-glow" style={{ width: `${((s.stamina ?? 100) / (s.maxStamina ?? 100)) * 100}%` }} />
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
                <div className="header-spacer header-spacer-wide">
                    {servants.length >= 2 && !multiSelectMode && (
                        <button
                            className="multi-chat-toggle-btn"
                            onClick={() => setMultiSelectMode(true)}
                            title="Start a group chat with multiple servants"
                        >
                            <GameIcon icon="users" size={12} /> Group Chat
                        </button>
                    )}
                </div>
            </div>

            <div className="servants-content">
                {/* Multi-select bar */}
                {multiSelectMode && (
                    <div className="multi-select-bar">
                        <span className="multi-select-info">
                            <GameIcon icon="users" size={12} />
                            Select servants for group chat ({multiSelected.size} selected)
                        </span>
                        <div className="multi-select-actions">
                            <button
                                className="multi-select-start-btn"
                                disabled={multiSelected.size < 2}
                                onClick={handleStartMultiChat}
                            >
                                <GameIcon icon="message-circle" size={12} />
                                Start Chat ({multiSelected.size})
                            </button>
                            <button className="multi-select-cancel-btn" onClick={cancelMultiSelect}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
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
                                    className={`servant-card ${multiSelectMode ? 'multi-select-mode' : ''} ${multiSelected.has(servant.name) ? 'multi-selected' : ''}`}
                                    style={{ '--char-color': servant.color } as React.CSSProperties}
                                    onClick={() => multiSelectMode ? toggleMultiSelect(servant.name) : setSelectedServant(servant)}
                                >
                                    {multiSelectMode && (
                                        <div className={`multi-select-check ${multiSelected.has(servant.name) ? 'checked' : ''}`}>
                                            {multiSelected.has(servant.name) ? '✓' : ''}
                                        </div>
                                    )}
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
                                        <div className="servant-mini-bar stamina-bar">
                                            <span className="servant-mini-bar-label"><GameIcon icon="zap" size={10} className="icon-yellow" /></span>
                                            <div className="servant-mini-bar-track">
                                                <div className="servant-mini-bar-fill" style={{ width: `${((servant.stamina ?? 100) / (servant.maxStamina ?? 100)) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`servant-chat-btn ${multiSelectMode ? 'hidden' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleStartChat(servant); }}
                                        title={`Chat with ${servant.name}`}
                                        disabled={multiSelectMode}
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
    const [activeCategory, setActiveCategory] = useState<TaskCategory | 'all'>('all');

    const availableTasks = stage().getAvailableTasksForServantByName(target.name);
    const categoryOrder: TaskCategory[] = ['room', 'exploration', 'training', 'upkeep', 'personal'];

    // Filter by search + category
    const filteredTasks = availableTasks.filter(t => {
        if (activeCategory !== 'all' && t.category !== activeCategory) return false;
        if (searchFilter) {
            const q = searchFilter.toLowerCase();
            return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        }
        return true;
    });

    // Category counts for tabs
    const categoryCounts: Record<string, number> = {};
    for (const t of availableTasks) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }

    // Calculate raw quality score (mirrors Stage.calculateTaskQuality but returns the number 0-120)
    const getQualityScore = (task: TaskDefinition): number => {
        let score = 0;
        if (task.primaryStat) {
            score += target.stats[task.primaryStat] ?? 0;
        } else {
            const vals = Object.values(target.stats);
            score += vals.reduce((s, v) => s + v, 0) / vals.length;
        }
        const applicable = getApplicableTraitModifiers(target, task);
        for (const { modifier } of applicable) {
            score += modifier.effect === 'bonus' ? modifier.magnitude : -modifier.magnitude;
        }
        if (task.roleBonus && target.assignedRole === task.roleBonus) score += 15;
        score += (target.obedience || 0) / 10;
        return Math.max(0, Math.min(120, score));
    };

    const getQualityLabel = (score: number) => {
        if (score >= 95) return 'masterful';
        if (score >= 75) return 'excellent';
        if (score >= 55) return 'good';
        if (score >= 40) return 'decent';
        if (score >= 25) return 'poor';
        return 'terrible';
    };

    const getQualityStars = (q: string) => {
        switch (q) {
            case 'masterful': return '★★★★★';
            case 'excellent': return '★★★★';
            case 'good': return '★★★';
            case 'decent': return '★★';
            case 'poor': return '★';
            default: return '—';
        }
    };

    // Render a task card in the left panel
    const renderTaskCard = (task: TaskDefinition) => {
        const reqCheck = checkTaskRequirements(target, task);
        const isLocked = !reqCheck.met;
        const hasActiveTask = !!target.activeTask;
        const score = getQualityScore(task);
        const quality = getQualityLabel(score);

        return (
            <div
                key={task.id}
                className={`task-card ${previewTask?.id === task.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => setPreviewTask(task)}
            >
                <div className="task-card-accent" style={{ backgroundColor: task.color }} />
                <div className="task-card-icon" style={{ color: task.color }}>
                    <GameIcon icon={task.icon} size={18} />
                </div>
                <div className="task-card-body">
                    <span className="task-card-name">{task.name}</span>
                    <span className="task-card-meta">
                        <span className="task-card-duration">
                            {Array.from({ length: Math.min(task.duration, 5) }, (_, i) => (
                                <span key={i} className="duration-pip" />
                            ))}
                        </span>
                        {task.manaCost ? (
                            <span className="task-card-mana"><GameIcon icon="sparkles" size={9} /> {task.manaCost}</span>
                        ) : null}
                        {task.staminaCost ? (
                            <span className="task-card-stamina"><GameIcon icon="zap" size={9} /> {task.staminaCost}</span>
                        ) : null}
                    </span>
                </div>
                <div className={`task-card-suitability suitability-${isLocked ? 'locked' : quality}`}>
                    {isLocked ? <GameIcon icon="lock" size={10} /> : <span className="suitability-diamond" />}
                </div>
            </div>
        );
    };

    // Preview panel calculations
    const previewReqCheck = previewTask ? checkTaskRequirements(target, previewTask) : null;
    const previewTraitMods = previewTask ? getApplicableTraitModifiers(target, previewTask) : [];
    const previewScore = previewTask ? getQualityScore(previewTask) : 0;
    const previewQuality = previewTask ? getQualityLabel(previewScore) : null;

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal" onClick={e => e.stopPropagation()}>
                {/* ── Header ── */}
                <div className="task-modal-header">
                    <div className="task-modal-title">
                        <GameIcon icon="scroll-text" size={14} />
                        <h3>Assign Task</h3>
                        <span className="task-modal-servant">{target.name}</span>
                    </div>
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

                {/* ── Category tabs ── */}
                <div className="task-category-tabs">
                    <button
                        className={`task-cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        <GameIcon icon="list-todo" size={11} />
                        <span>All</span>
                        <span className="tab-count">{availableTasks.length}</span>
                    </button>
                    {categoryOrder.map(cat => {
                        const count = categoryCounts[cat] || 0;
                        if (count === 0) return null;
                        return (
                            <button
                                key={cat}
                                className={`task-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                <GameIcon icon={getTaskCategoryIcon(cat)} size={11} />
                                <span>{getTaskCategoryLabel(cat)}</span>
                                <span className="tab-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="task-modal-body">
                    {/* ── Left: task cards ── */}
                    <div className="task-list">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(renderTaskCard)
                        ) : (
                            <div className="task-list-empty">
                                <GameIcon icon="search" size={20} />
                                <p>No tasks found</p>
                            </div>
                        )}
                    </div>

                    {/* ── Right: task detail panel ── */}
                    <div className="task-detail">
                        {previewTask ? (
                            <>
                                <div className="task-detail-scroll">
                                    {/* Hero header with glowing icon */}
                                    <div className="task-detail-header">
                                        <div className="task-detail-icon-aura" style={{ '--task-glow': previewTask.color } as React.CSSProperties}>
                                            <GameIcon icon={previewTask.icon} size={28} />
                                        </div>
                                        <h4 className="task-detail-name" style={{ color: previewTask.color }}>
                                            {previewTask.name}
                                        </h4>
                                        <span className="task-detail-tag">
                                            <GameIcon icon={getTaskCategoryIcon(previewTask.category)} size={10} />
                                            {previewTask.roomType
                                                ? getRoomTypeLabel(previewTask.roomType)
                                                : getTaskCategoryLabel(previewTask.category)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div className="task-detail-desc">
                                        <p>{previewTask.description}</p>
                                    </div>

                                    {/* Info chips: duration + cost + role */}
                                    <div className="task-detail-info">
                                        <div className="task-info-chip">
                                            <GameIcon icon="clock" size={12} />
                                            <span>{previewTask.duration} turn{previewTask.duration !== 1 ? 's' : ''}</span>
                                        </div>
                                        {previewTask.manaCost ? (
                                            <div className="task-info-chip mana">
                                                <GameIcon icon="sparkles" size={12} />
                                                <span>{previewTask.manaCost} mana</span>
                                            </div>
                                        ) : null}
                                        {previewTask.staminaCost ? (
                                            <div className={`task-info-chip stamina ${(target.stamina ?? 100) < previewTask.staminaCost ? 'insufficient' : ''}`}>
                                                <GameIcon icon="zap" size={12} />
                                                <span>{previewTask.staminaCost} stamina</span>
                                            </div>
                                        ) : null}
                                        {previewTask.roleBonus && (() => {
                                            const role = getRoleById(previewTask.roleBonus!);
                                            const hasBonus = target.assignedRole === previewTask.roleBonus;
                                            return role ? (
                                                <div className={`task-info-chip ${hasBonus ? 'role-active' : 'role-inactive'}`}>
                                                    <GameIcon icon="shield-plus" size={12} />
                                                    <span>{role.name}</span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>

                                    {/* ── Quality gauge ── */}
                                    <div className="task-detail-gauge">
                                        <div className="task-gauge-header">
                                            <span className="task-gauge-title">Suitability</span>
                                            <span className={`task-gauge-rating quality-${previewQuality}`}>
                                                {getQualityStars(previewQuality!)} {previewQuality!.charAt(0).toUpperCase() + previewQuality!.slice(1)}
                                            </span>
                                        </div>
                                        <div className="task-gauge-track">
                                            <div className="task-gauge-zone zone-terrible" />
                                            <div className="task-gauge-zone zone-poor" />
                                            <div className="task-gauge-zone zone-decent" />
                                            <div className="task-gauge-zone zone-good" />
                                            <div className="task-gauge-zone zone-excellent" />
                                            <div className="task-gauge-zone zone-masterful" />
                                            <div
                                                className={`task-gauge-marker quality-${previewQuality}`}
                                                style={{ left: `${Math.min(100, (previewScore / 120) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="task-gauge-labels">
                                            <span>Terrible</span>
                                            <span>Decent</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>

                                    {/* ── Requirements as stat bars ── */}
                                    {previewTask.requirements.length > 0 && (
                                        <div className="task-detail-section">
                                            <h5>Requirements</h5>
                                            {previewTask.requirements.map((req, i) => {
                                                const current = target.stats[req.stat] ?? 0;
                                                const met = current >= req.minimum;
                                                return (
                                                    <div key={i} className={`task-stat-row ${met ? 'met' : 'unmet'}`}>
                                                        <div className="task-stat-label">
                                                            <span className={`task-stat-check ${met ? 'met' : 'unmet'}`}>{met ? '✓' : '✗'}</span>
                                                            <span className="task-stat-name">{req.stat}</span>
                                                        </div>
                                                        <div className="task-stat-bar-track">
                                                            <div
                                                                className={`task-stat-bar-fill ${met ? 'met' : 'unmet'}`}
                                                                style={{ width: `${Math.min(100, current)}%` }}
                                                            />
                                                            <div
                                                                className="task-stat-threshold"
                                                                style={{ left: `${Math.min(100, req.minimum)}%` }}
                                                            />
                                                        </div>
                                                        <span className="task-stat-values">
                                                            <span className={met ? 'val-met' : 'val-unmet'}>{current}</span>
                                                            <span className="task-stat-sep">/</span>
                                                            <span>{req.minimum}</span>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* ── Trait effects as compact chips ── */}
                                    {previewTask.traitModifiers.length > 0 && (
                                        <div className="task-detail-section">
                                            <h5>Trait Effects</h5>
                                            <div className="task-trait-grid">
                                                {previewTask.traitModifiers.map((mod, i) => {
                                                    const isActive = previewTraitMods.some(a => a.modifier.traitKey === mod.traitKey);
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`task-trait-chip ${mod.effect} ${isActive ? 'active' : 'inactive'}`}
                                                            title={mod.description}
                                                        >
                                                            <span className="task-trait-sign">{mod.effect === 'bonus' ? '+' : '−'}</span>
                                                            <span className="task-trait-label">{mod.traitKey}</span>
                                                            {isActive && <span className="task-trait-dot" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Rewards as chips ── */}
                                    <div className="task-detail-section">
                                        <h5>Rewards</h5>
                                        <div className="task-reward-grid">
                                            {previewTask.rewards.map((reward, i) => (
                                                <div key={i} className={`task-reward-chip reward-${reward.type}`}>
                                                    <span className="task-reward-chip-icon">
                                                        {reward.type === 'gold' && <GameIcon icon="coins" size={13} />}
                                                        {reward.type === 'mana' && <GameIcon icon="sparkles" size={13} />}
                                                        {reward.type === 'item' && <GameIcon icon="package" size={13} />}
                                                        {reward.type === 'stat' && <GameIcon icon="trending-up" size={13} />}
                                                        {reward.type === 'household' && <GameIcon icon="building" size={13} />}
                                                    </span>
                                                    <span className="task-reward-chip-text">
                                                        {reward.type === 'gold' && `${reward.amount} Gold`}
                                                        {reward.type === 'mana' && `${reward.amount} Mana`}
                                                        {reward.type === 'item' && `${reward.amount}× ${reward.itemName}`}
                                                        {reward.type === 'stat' && `+${reward.amount} ${reward.stat}`}
                                                        {reward.type === 'household' && `+${reward.amount} ${reward.stat}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky footer */}
                                <div className="task-detail-footer">
                                    <button
                                        className="task-detail-assign-btn"
                                        disabled={!previewReqCheck?.met || !!target.activeTask || (previewTask.staminaCost ? (target.stamina ?? 100) < previewTask.staminaCost : false)}
                                        onClick={() => onAssign(previewTask.id)}
                                    >
                                        {target.activeTask ? 'Already on a Task' :
                                         !previewReqCheck?.met ? 'Requirements Not Met' :
                                         (previewTask.staminaCost && (target.stamina ?? 100) < previewTask.staminaCost) ? 'Not Enough Stamina' :
                                         'Assign Task'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="task-detail-empty">
                                <div className="task-detail-empty-aura">
                                    <GameIcon icon="scroll-text" size={32} />
                                </div>
                                <p>Select a task to view details</p>
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
    const qualityConfig: Record<string, { color: string; stars: string; label: string; glow: string }> = {
        excellent: { color: '#d4a040', stars: '★★★', label: 'Excellent', glow: 'rgba(212, 160, 64, 0.35)' },
        standard: { color: '#78a8d0', stars: '★★', label: 'Standard', glow: 'rgba(120, 168, 208, 0.25)' },
        poor:     { color: '#a06060', stars: '★', label: 'Poor', glow: 'rgba(160, 96, 96, 0.25)' },
    };
    const qc = qualityConfig[outcome.quality] || qualityConfig.standard;

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'gold': return 'coins';
            case 'mana': return 'sparkles';
            case 'item': return 'package';
            case 'stat': return 'trending-up';
            case 'household': return 'building';
            default: return 'gift';
        }
    };

    const getRewardLabel = (reward: TaskReward) => {
        switch (reward.type) {
            case 'gold': return `+${reward.amount} Gold`;
            case 'mana': return `+${reward.amount} Mana`;
            case 'item': return `+${reward.amount}× ${reward.itemName}`;
            case 'stat': return `+${reward.amount} ${reward.stat}`;
            case 'household': return `+${reward.amount} ${reward.stat}`;
            default: return `+${reward.amount}`;
        }
    };

    return (
        <div className="task-outcome-overlay" onClick={onDismiss}>
            <div className="task-outcome-panel" onClick={e => e.stopPropagation()}
                 style={{ '--outcome-accent': qc.color, '--outcome-glow': qc.glow } as React.CSSProperties}>

                {/* ── Accent bar ── */}
                <div className="task-outcome-accent" />

                {/* ── Header ── */}
                <div className="task-outcome-header">
                    <div className="task-outcome-title">Task Complete</div>
                    <div className="task-outcome-servant">{servantName}</div>
                </div>

                {/* ── Quality badge ── */}
                <div className={`task-outcome-quality quality-${outcome.quality}`}>
                    <span className="task-outcome-quality-stars">{qc.stars}</span>
                    <span className="task-outcome-quality-label">{qc.label}</span>
                </div>

                {/* ── Divider ── */}
                <div className="task-outcome-divider" />

                {/* ── Rewards ── */}
                <div className="task-outcome-rewards">
                    <div className="task-outcome-rewards-heading">Rewards Earned</div>
                    <div className="task-outcome-rewards-list">
                        {outcome.rewards.map((reward, i) => (
                            <div key={i} className="task-outcome-reward-card">
                                <div className="task-outcome-reward-icon-box">
                                    <GameIcon icon={getRewardIcon(reward.type)} size={16} />
                                </div>
                                <div className="task-outcome-reward-info">
                                    <div className="task-outcome-reward-value">{getRewardLabel(reward)}</div>
                                    {reward.narrative && (
                                        <div className="task-outcome-reward-narrative">{reward.narrative}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Continue button ── */}
                <button className="task-outcome-dismiss" onClick={onDismiss}>
                    Continue
                </button>
            </div>
        </div>
    );
};
