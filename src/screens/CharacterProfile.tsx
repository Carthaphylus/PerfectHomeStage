import React, { FC, ReactNode } from 'react';
import type { Stage } from '../Stage';
import { Stage as StageClass } from '../Stage';
import { STAT_DEFINITIONS, numberToGrade, getGradeColor, getStatColor } from '../data';
import type { StatName } from '../data';
import { CharacterGallery } from './CharacterGallery';
import { TraitChip } from './TraitChip';
import { GameIcon } from './GameIcon';

/**
 * Shared character data shape — every profile passes this.
 */
export interface CharacterProfileData {
    name: string;
    avatar: string;
    color: string;
    title: string;              // e.g. heroClass, formerClass, "The Witch of the Manor"
    description: string;
    traits: string[];
    details: Record<string, string>;
    stats?: Record<StatName, number>;
}

/**
 * Optional sections that differ per role.
 * Rendered between "About" and "Details" in the bio panel.
 */
export interface CharacterProfileProps {
    stage: () => Stage;
    character: CharacterProfileData;
    onBack: () => void;
    backLabel?: string;          // e.g. "< Back", "< Menu"

    /** Badge below the title (e.g. hero status) */
    statusBadge?: ReactNode;

    /** Action buttons under the card (Gallery is always included) */
    extraActions?: ReactNode;

    /** Extra bio sections rendered between About and Details */
    extraSections?: ReactNode;

    /** Assigned role with traits and color (for servants) */
    assignedRole?: {
        name: string;
        color: string;
        traits: string[];
    };

    /** Traits granted by the conversion archetype (displayed differently) */
    archetypeTraits?: string[];

    /** Color for the title text (e.g. servant title color) */
    titleColor?: string;

    /** Whether the portrait regenerate button is shown (only for generated characters) */
    canRegenerate?: boolean;
}

export const CharacterProfile: FC<CharacterProfileProps> = ({
    stage,
    character,
    onBack,
    backLabel = '< Back',
    statusBadge,
    extraActions,
    extraSections,
    assignedRole,    archetypeTraits, titleColor, canRegenerate = false,}) => {
    const [showGallery, setShowGallery] = React.useState(false);
    const [showRegenPrompt, setShowRegenPrompt] = React.useState(false);
    const [regenPrompt, setRegenPrompt] = React.useState('');
    const [regenLoading, setRegenLoading] = React.useState(false);
    const [regenError, setRegenError] = React.useState<string | null>(null);
    const [avatarOverride, setAvatarOverride] = React.useState<string | null>(null);

    // Use local override if we regenerated, otherwise use the prop
    const displayAvatar = avatarOverride || character.avatar;

    // Build default prompt when opening the editor
    const openRegenEditor = () => {
        const defaultPrompt = StageClass.buildPortraitPrompt(
            character.details['Species'] || 'animal',
            character.title || 'adventurer',
            character.details['Gender']?.includes('Male') ? 'Male' : 'Female',
        );
        setRegenPrompt(defaultPrompt);
        setRegenError(null);
        setShowRegenPrompt(true);
    };

    const handleRegenerate = async () => {
        setRegenLoading(true);
        setRegenError(null);
        try {
            const result = await stage().regeneratePortrait(character.name, regenPrompt || undefined);
            if (result) {
                setAvatarOverride(result);
                setShowRegenPrompt(false);
            } else {
                setRegenError('No image returned. Try adjusting the prompt.');
            }
        } catch (err: any) {
            setRegenError(err?.message || 'Generation failed.');
        } finally {
            setRegenLoading(false);
        }
    };

    if (showGallery) {
        return (
            <CharacterGallery
                stage={stage}
                charName={character.name}
                charAvatar={character.avatar}
                charSpecies={character.details['Species'] || 'character'}
                charColor={character.color}
                onClose={() => setShowGallery(false)}
            />
        );
    }

    return (
        <div className="char-profile-screen" style={{ '--char-color': character.color } as React.CSSProperties}>
            <div className="screen-header">
                <button className="back-button" onClick={onBack}>
                    {backLabel}
                </button>
                <h2>{character.name}</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="char-profile-content">
                {/* ── Left: Card ── */}
                <div className="char-card">
                    <div className="char-avatar-frame">
                        {displayAvatar ? (
                            <img src={displayAvatar} alt={character.name} />
                        ) : (
                            <div className="avatar-placeholder avatar-placeholder-large">
                                <GameIcon icon="user" size={48} />
                                <span className="avatar-generating">Portrait generating...</span>
                            </div>
                        )}
                    </div>
                    <div className="char-info">
                        <h3 className="char-name">{character.name}</h3>
                        <span className="char-title" style={titleColor ? { color: titleColor } : undefined}>{character.title}</span>
                        {statusBadge}
                    </div>
                    <div className="char-action-btns">
                        <button className="gallery-open-btn" onClick={() => setShowGallery(true)}>
                            <GameIcon icon="image" size={12} /> Gallery
                        </button>
                        {canRegenerate && (
                            <button
                                className="gallery-open-btn regen-btn"
                                onClick={openRegenEditor}
                                disabled={regenLoading}
                            >
                                <GameIcon icon="refresh-cw" size={12} /> {regenLoading ? 'Generating...' : 'Regenerate'}
                            </button>
                        )}
                        {extraActions}
                    </div>

                    {/* ── Regenerate Prompt Editor ── */}
                    {showRegenPrompt && (
                        <div className="regen-prompt-panel">
                            <label className="regen-label">Image Prompt</label>
                            <textarea
                                className="regen-textarea"
                                value={regenPrompt}
                                onChange={e => setRegenPrompt(e.target.value)}
                                rows={5}
                                disabled={regenLoading}
                            />
                            <div className="regen-actions">
                                <button
                                    className="regen-generate-btn"
                                    onClick={handleRegenerate}
                                    disabled={regenLoading || !regenPrompt.trim()}
                                >
                                    {regenLoading ? 'Generating...' : 'Generate'}
                                </button>
                                <button
                                    className="regen-cancel-btn"
                                    onClick={() => setShowRegenPrompt(false)}
                                    disabled={regenLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                            {regenError && <span className="regen-error">{regenError}</span>}
                        </div>
                    )}
                </div>

                {/* ── Right: Bio Panel ── */}
                <div className="char-bio-panel">
                    <div className="char-bio-section">
                        <h4>About</h4>
                        <p>{character.description}</p>
                    </div>

                    {/* Role-specific sections */}
                    {extraSections}

                    <div className="char-bio-section">
                        <h4>Details</h4>
                        {Object.entries(character.details).map(([key, value]) => (
                            <div key={key} className="char-detail-row">
                                <span className="char-detail-label">{key}</span>
                                {key === 'Gender' ? (
                                    <span className="char-detail-value char-gender-value">
                                        <span className="gender-symbol">{value.split(' ')[0]}</span>
                                        <span>{value.split(' ').slice(1).join(' ')}</span>
                                    </span>
                                ) : (
                                    <span className="char-detail-value">{value}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {character.stats && (
                        <div className="char-bio-section">
                            <h4>Stats</h4>
                            <div className="char-stat-block">
                                {STAT_DEFINITIONS.map(statDef => {
                                    const value = (character.stats && character.stats[statDef.name]) || 0;
                                    const grade = numberToGrade(value);
                                    const gradeColor = getGradeColor(grade);
                                    const statColor = getStatColor(statDef.name);
                                    const totalBlocks = 20;
                                    const filledBlocks = Math.round((value / 100) * totalBlocks);
                                    return (
                                        <div key={statDef.name} className="stat-row" style={{ '--stat-color': statColor } as React.CSSProperties}>
                                            <div className="stat-row-header">
                                                <span 
                                                    className="stat-grade-letter" 
                                                    style={{ color: gradeColor }}
                                                >
                                                    {grade}
                                                </span>
                                                <span className="stat-name" style={{ color: statColor }}>
                                                    {statDef.label}
                                                </span>
                                                <span className="stat-value-num" style={{ color: statColor }}>{value}</span>
                                            </div>
                                            <div className="stat-bar-row">
                                                <div className="stat-blocks-container">
                                                    {Array.from({ length: totalBlocks }).map((_, i) => {
                                                        const isFilled = i < filledBlocks;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`stat-block ${isFilled ? 'filled' : ''}`}
                                                                style={{
                                                                    ['--stat-fill-color' as any]: statColor,
                                                                    borderColor: isFilled ? statColor : `color-mix(in srgb, ${statColor} 25%, transparent)`,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="char-bio-section">
                        <h4>Traits</h4>
                        <div className="char-trait-list">{character.traits
                            .filter(t => !archetypeTraits?.includes(t))
                            .map(t => (
                                <TraitChip
                                    key={`innate-${t}`} 
                                    trait={t}
                                    className="char-trait char-trait-innate"
                                    color={character.color}
                                    source="character"
                                />
                            ))}
                            {archetypeTraits?.map(t => (
                                <TraitChip
                                    key={`arch-${t}`}
                                    trait={t}
                                    className="char-trait char-trait-archetype"
                                    color="#fbbf24"
                                    source="archetype"
                                />
                            ))}
                            {assignedRole?.traits.map(t => (
                                <TraitChip
                                    key={`role-${t}`} 
                                    trait={t}
                                    className="char-trait char-trait-role"
                                    color={assignedRole.color}
                                    source="room"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
