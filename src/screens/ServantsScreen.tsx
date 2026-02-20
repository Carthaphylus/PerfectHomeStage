import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, Servant, Role, getRoleById, ROOM_ROLES, STAT_DEFINITIONS, numberToGrade, getGradeColor } from '../Stage';
import { CharacterProfile } from './CharacterProfile';
import { TraitChip } from './TraitChip';

interface ServantsScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
    startScene: (participants: string[], location: string) => void;
}

export const ServantsScreen: FC<ServantsScreenProps> = ({ stage, setScreenType, startScene }) => {
    const servants = Object.values(stage().currentState.servants);
    const [selectedServant, setSelectedServant] = useState<Servant | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleTarget, setRoleTarget] = useState<Servant | null>(null); // servant being assigned

    const handleStartChat = (servant: Servant) => {
        const location = stage().currentState.location;
        startScene([servant.name], location);
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
                        title: s.formerClass,
                        description: s.description,
                        traits: s.traits,
                        details: s.details,
                        stats: s.stats || { prowess: 50, expertise: 50, attunement: 50, presence: 50, discipline: 50, insight: 50 },
                    }}
                    onBack={() => setSelectedServant(null)}
                    statusBadge={currentRole && (
                        <div className="char-role-badge" style={{ 
                            borderColor: currentRole.color,
                            color: currentRole.color,
                        }}>
                            {currentRole.icon} {currentRole.name}
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
                                💬 Chat
                            </button>
                            <button
                                className="gallery-open-btn role-btn"
                                onClick={() => openRoleModal(s)}
                            >
                                {currentRole ? `${currentRole.icon} Change Role` : '📋 Assign Role'}
                            </button>
                        </>
                    }
                    extraSections={
                        <div className="char-bio-section">
                            <h4>Service</h4>
                            <div className="char-detail-row">
                                <span className="char-detail-label">Loyalty</span>
                                <span className="char-detail-value">{s.loyalty}%</span>
                            </div>
                            {currentRole && (
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Role</span>
                                    <span className="char-detail-value">{currentRole.icon} {currentRole.name}</span>
                                </div>
                            )}
                            {currentRole && (
                                <div className="role-buffs-section">
                                    <h4>Role Buffs</h4>
                                    {currentRole.buffs.map((buff, i) => (
                                        <div key={i} className="role-buff-row">
                                            <span className="role-buff-label">{buff.label}</span>
                                        </div>
                                    ))}
                                    {currentRole.traits.length > 0 && (
                                        <div className="role-trait-row">
                                            <span className="char-detail-label">Granted Traits</span>
                                            <div className="role-trait-chip-row">
                                                {currentRole.traits.map((trait, index) => (
                                                    <TraitChip
                                                        key={`${trait}-${index}`}
                                                        trait={trait}
                                                        className="char-trait char-trait-role"
                                                        color={currentRole.color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        className="role-unassign-btn"
                                        onClick={() => handleUnassignRole(s)}
                                    >
                                        Remove Role
                                    </button>
                                </div>
                            )}
                            {s.assignedTask && (
                                <div className="char-detail-row">
                                    <span className="char-detail-label">Task</span>
                                    <span className="char-detail-value">{s.assignedTask}</span>
                                </div>
                            )}
                            <div className="char-loyalty-bar">
                                <div className="char-loyalty-fill" style={{ width: `${s.loyalty}%` }} />
                            </div>
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
                            const subtitleText = role ? `${role.icon} ${role.name}` : servant.formerClass;
                            const subtitleColor = role ? role.color : undefined;
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
                                            {subtitleText}
                                        </span>
                                    </div>

                                    {/* Assign role button only when no role */}
                                    {!role && (
                                        <button
                                            className="servant-assign-btn"
                                            onClick={(e) => { e.stopPropagation(); openRoleModal(servant); }}
                                            title="Assign a role"
                                        >
                                            📋 Assign Role
                                        </button>
                                    )}

                                    <div className="servant-loyalty-bar">
                                        <div
                                            className="servant-loyalty-fill"
                                            style={{ width: `${servant.loyalty}%` }}
                                        />
                                        <span className="servant-loyalty-text">{servant.loyalty}%</span>
                                    </div>
                                    <button
                                        className="servant-chat-btn"
                                        onClick={(e) => { e.stopPropagation(); handleStartChat(servant); }}
                                        title={`Chat with ${servant.name}`}
                                    >
                                        💬
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
            holderLabel = `⇄ ${otherHolders[0].name}`;
        } else if (!role.unique && otherHolders.length > 0) {
            holderLabel = `${otherHolders.length} assigned`;
        }

        // Button label
        let btnLabel = 'Assign';
        if (isCurrentTarget) {
            btnLabel = '✓';
        } else if (role.unique && otherHolders.length > 0) {
            btnLabel = 'Replace';
        }

        return (
            <div
                key={role.id}
                className={`role-row ${previewRole?.id === role.id ? 'previewing' : ''} ${isCurrentTarget ? 'current' : ''}`}
                onClick={() => setPreviewRole(role)}
            >
                <span className="role-row-icon">{role.icon}</span>
                <div className="role-row-info">
                    <span className="role-row-name" style={{ color: role.color }}>
                        {role.name}
                        {!role.unique && <span className="role-row-multi-badge" title="Multiple servants can hold this role">∞</span>}
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
                    <button className="role-modal-close" onClick={onClose}>✕</button>
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
                                <div className="role-preview-icon">{previewRole.icon}</div>
                                <h4 className="role-preview-name" style={{ color: previewRole.color }}>{previewRole.name}</h4>
                                <span className={`role-preview-uniqueness ${previewRole.unique ? 'unique' : 'shared'}`}>
                                    {previewRole.unique ? '🔒 Unique Role' : '♾️ Shared Role'}
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
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewRole.roomType && (
                                    <div className="role-preview-room">
                                        📍 {roomLabel(previewRole.roomType)}
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
                                <div className="role-preview-empty-icon">📋</div>
                                <p>Select a role to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
