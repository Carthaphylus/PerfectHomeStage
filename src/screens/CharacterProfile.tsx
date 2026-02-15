import React, { FC, ReactNode } from 'react';
import { Stage } from '../Stage';
import { CharacterGallery } from './CharacterGallery';

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
}

export const CharacterProfile: FC<CharacterProfileProps> = ({
    stage,
    character,
    onBack,
    backLabel = '< Back',
    statusBadge,
    extraActions,
    extraSections,
}) => {
    const [showGallery, setShowGallery] = React.useState(false);

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
                        <img src={character.avatar} alt={character.name} />
                    </div>
                    <div className="char-info">
                        <h3 className="char-name">{character.name}</h3>
                        <span className="char-title">{character.title}</span>
                        {statusBadge}
                    </div>
                    <div className="char-action-btns">
                        <button className="gallery-open-btn" onClick={() => setShowGallery(true)}>
                            🖼️ Gallery
                        </button>
                        {extraActions}
                    </div>
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

                    <div className="char-bio-section">
                        <h4>Traits</h4>
                        <div className="char-trait-list">
                            {character.traits.map(t => (
                                <span key={t} className="char-trait">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
