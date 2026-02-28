import React, { FC, useState } from 'react';
import type { Stage } from '../Stage';
import { Stage as StageClass } from '../Stage';
import { AspectRatio } from '@chub-ai/stages-ts';
import { GameIcon } from './GameIcon';

// Generation slot types
export type GenerationSlotType =
    | 'portrait_regen'
    | 'bg_removed'
    | 'hypno_citrine'
    | 'hypno_julian'
    | 'hypno_flores'
    | 'outfit_lingerie';

interface GenerationSlot {
    type: GenerationSlotType;
    label: string;
    description: string;
    icon: string;
}

const GENERATION_SLOTS: GenerationSlot[] = [
    {
        type: 'bg_removed',
        label: 'No Background',
        description: 'Portrait with transparent background',
        icon: 'image',
    },
    {
        type: 'hypno_citrine',
        label: 'Citrine\u2019s Trance',
        description: 'Golden glowing eyes, drooling, happy trance',
        icon: 'sparkle',
    },
    {
        type: 'hypno_julian',
        label: 'Julian\u2019s Trance',
        description: 'Blue glowing eyes, blank and empty trance',
        icon: 'diamond',
    },
    {
        type: 'hypno_flores',
        label: 'Flores\u2019s Trance',
        description: 'Purple glowing eyes, drooling, drained, blushing',
        icon: 'flower',
    },
    {
        type: 'outfit_lingerie',
        label: 'Lingerie',
        description: 'Character in lingerie outfit',
        icon: 'gem',
    },
];

const REGEN_SLOT: GenerationSlot = {
    type: 'portrait_regen',
    label: 'New Portrait',
    description: 'Generate a fresh portrait from scratch',
    icon: 'refresh-cw',
};

// Prompt builders for each generation type
function buildPrompt(type: GenerationSlotType, charName: string, charSpecies: string): string {
    const base = `${charName}, ${charSpecies}, anime style, high quality, detailed`;
    switch (type) {
        case 'hypno_citrine':
            return `${base}, golden glowing eyes, spiral eyes, drooling, happy vacant smile, hypnotized trance, mesmerized, glowing golden light in eyes`;
        case 'hypno_julian':
            return `${base}, blue glowing eyes, blank empty expression, mindless trance, hypnotized, dull vacant stare, glowing blue light in eyes`;
        case 'hypno_flores':
            return `${base}, purple glowing eyes, drooling, drained expression, blushing heavily, hypnotized trance, glowing purple light in eyes`;
        case 'outfit_lingerie':
            return `${base}, wearing elegant lace lingerie, seductive pose, bedroom setting, soft lighting`;
        default:
            return base;
    }
}

interface CharacterGalleryProps {
    stage: () => Stage;
    charName: string;
    charAvatar: string;
    charSpecies: string;
    charColor: string;
    charClass?: string;
    charGender?: string;
    canRegenerate?: boolean;
    onClose: () => void;
}

export const CharacterGallery: FC<CharacterGalleryProps> = ({
    stage,
    charName,
    charAvatar,
    charSpecies,
    charColor,
    charClass = 'adventurer',
    charGender = 'Female',
    canRegenerate = false,
    onClose,
}) => {
    // Track generated image URLs: type -> url
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>(() => {
        // Try to load from chatState
        const saved = stage().chatState.generatedImages;
        return saved?.[charName] || {};
    });
    const [loadingSlot, setLoadingSlot] = useState<GenerationSlotType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    // Prompt editor state
    const [editingSlot, setEditingSlot] = useState<GenerationSlot | null>(null);
    const [editPrompt, setEditPrompt] = useState('');

    // Manual image URL state
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [manualUrl, setManualUrl] = useState('');

    const saveImage = (slotType: GenerationSlotType, url: string) => {
        // Update local state
        const updated = { ...generatedImages, [slotType]: url };
        setGeneratedImages(updated);

        // Persist to chatState
        const chatState = stage().chatState;
        if (!chatState.generatedImages) {
            chatState.generatedImages = {};
        }
        chatState.generatedImages[charName] = updated;
    };

    /** Open the prompt editor popup for a slot (instead of generating immediately) */
    const openPromptEditor = (slot: GenerationSlot) => {
        let defaultPrompt: string;
        if (slot.type === 'portrait_regen') {
            defaultPrompt = StageClass.buildPortraitPrompt(charSpecies, charClass, charGender);
        } else if (slot.type === 'bg_removed') {
            defaultPrompt = ''; // bg_removed doesn't use a prompt
        } else {
            defaultPrompt = buildPrompt(slot.type, charName, charSpecies);
        }
        setEditPrompt(defaultPrompt);
        setEditingSlot(slot);
        setError(null);
    };

    /** Generate with the (possibly edited) prompt */
    const handleGenerate = async (slot: GenerationSlot, customPrompt?: string) => {
        setEditingSlot(null);
        setLoadingSlot(slot.type);
        setError(null);

        try {
            const gen = stage().generator;

            if (slot.type === 'portrait_regen') {
                // Generate a brand new portrait using makeImage (same as initial NPC generation)
                const prompt = customPrompt || StageClass.buildPortraitPrompt(charSpecies, charClass, charGender);
                const result = await gen.makeImage({
                    prompt,
                    negative_prompt: StageClass.PORTRAIT_NEGATIVE,
                    aspect_ratio: AspectRatio.PHOTO_VERTICAL,
                    remove_background: false,
                });
                if (result?.url) {
                    saveImage(slot.type, result.url);
                    // Also update the character's base avatar
                    const st = stage().currentState;
                    const target = st.heroes[charName] || st.servants?.[charName];
                    if (target) target.avatar = result.url;
                    // Persist under 'portrait' key for chatState
                    const chatState = stage().chatState;
                    if (!chatState.generatedImages) chatState.generatedImages = {};
                    if (!chatState.generatedImages[charName]) chatState.generatedImages[charName] = {};
                    chatState.generatedImages[charName]['portrait'] = result.url;
                } else {
                    setError('No image returned from generation.');
                }
            } else if (slot.type === 'bg_removed') {
                // Use dedicated removeBackground API
                const result = await gen.removeBackground({ image: charAvatar });
                if (result?.url) {
                    saveImage(slot.type, result.url);
                } else {
                    setError('No result from background removal.');
                }
            } else {
                // Use imageToImage for expression/outfit changes
                // Following the pattern from Lord-Raven's working stage:
                // - transfer_type: 'edit' is required
                // - minimal payload (no aspect_ratio, seed, item_id, etc.)
                // - remove_background done as separate step after img2img
                const prompt = customPrompt || buildPrompt(slot.type, charName, charSpecies);

                const result = await gen.imageToImage({
                    image: charAvatar,
                    prompt,
                    remove_background: true,
                    transfer_type: 'edit',
                } as any);

                if (result?.url) {
                    // Do a separate removeBackground call on the result
                    try {
                        const bgRemoved = await gen.removeBackground({ image: result.url });
                        saveImage(slot.type, bgRemoved?.url || result.url);
                    } catch {
                        saveImage(slot.type, result.url);
                    }
                } else {
                    setError('No result from image generation.');
                }
            }
        } catch (err: any) {
            setError(err?.message || 'Generation failed.');
        } finally {
            setLoadingSlot(null);
        }
    };

    /** Apply a manually entered image URL as the character's portrait */
    const handleApplyManualUrl = () => {
        const url = manualUrl.trim();
        if (!url) return;
        // Update avatar on the character object
        const st = stage().currentState;
        const target = st.heroes[charName] || st.servants?.[charName];
        if (target) target.avatar = url;
        // Persist
        const chatState = stage().chatState;
        if (!chatState.generatedImages) chatState.generatedImages = {};
        if (!chatState.generatedImages[charName]) chatState.generatedImages[charName] = {};
        chatState.generatedImages[charName]['portrait'] = url;
        setShowUrlInput(false);
        setManualUrl('');
    };

    return (
        <div className="char-gallery-overlay" style={{ '--char-color': charColor } as React.CSSProperties}>
            {/* Expanded image viewer */}
            {expandedImage && (
                <div className="gallery-lightbox" onClick={() => setExpandedImage(null)}>
                    <img src={expandedImage} alt="Expanded" />
                    <div className="lightbox-close"><GameIcon icon="x" size={14} /></div>
                </div>
            )}

            {/* Prompt editor popup */}
            {editingSlot && (
                <div className="gallery-prompt-overlay" onClick={() => setEditingSlot(null)}>
                    <div className="gallery-prompt-popup" onClick={e => e.stopPropagation()}>
                        <div className="prompt-popup-header">
                            <GameIcon icon={editingSlot.icon} size={14} />
                            <span>{editingSlot.label} — Edit Prompt</span>
                        </div>
                        <textarea
                            className="prompt-popup-textarea"
                            value={editPrompt}
                            onChange={e => setEditPrompt(e.target.value)}
                            rows={6}
                        />
                        <div className="prompt-popup-actions">
                            <button
                                className="prompt-popup-generate"
                                onClick={() => handleGenerate(editingSlot, editPrompt || undefined)}
                                disabled={!editPrompt.trim()}
                            >
                                <GameIcon icon="sparkle" size={12} /> Generate
                            </button>
                            <button
                                className="prompt-popup-cancel"
                                onClick={() => setEditingSlot(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual URL input popup */}
            {showUrlInput && (
                <div className="gallery-prompt-overlay" onClick={() => setShowUrlInput(false)}>
                    <div className="gallery-prompt-popup" onClick={e => e.stopPropagation()}>
                        <div className="prompt-popup-header">
                            <GameIcon icon="link" size={14} />
                            <span>Set Portrait Image URL</span>
                        </div>
                        <input
                            className="prompt-popup-url-input"
                            type="text"
                            placeholder="Paste image URL here..."
                            value={manualUrl}
                            onChange={e => setManualUrl(e.target.value)}
                        />
                        {manualUrl.trim() && (
                            <div className="prompt-popup-preview">
                                <img src={manualUrl.trim()} alt="Preview" onError={e => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                        <div className="prompt-popup-actions">
                            <button
                                className="prompt-popup-generate"
                                onClick={handleApplyManualUrl}
                                disabled={!manualUrl.trim()}
                            >
                                <GameIcon icon="check" size={12} /> Apply
                            </button>
                            <button
                                className="prompt-popup-cancel"
                                onClick={() => setShowUrlInput(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="gallery-book">
                {/* Book spine / binding */}
                <div className="book-spine"></div>

                {/* Left page: Character portrait + info */}
                <div className="book-page book-page-left">
                    <div className="page-corner page-corner-tl"></div>
                    <div className="page-corner page-corner-bl"></div>

                    <button className="gallery-back-btn" onClick={onClose}>
                        <span className="back-arrow"><GameIcon icon="chevron-left" size={12} /></span>
                        <span className="back-label">Return</span>
                    </button>

                    <div className="book-portrait">
                        <img src={charAvatar} alt={charName} />
                    </div>

                    <div className="book-title-area">
                        <div className="book-ornament">~ <GameIcon icon="sparkle" size={10} className="icon-gold" /> ~</div>
                        <h3 className="book-char-name">{charName}</h3>
                        <div className="book-subtitle">{charSpecies}</div>
                        <div className="book-ornament">~ <GameIcon icon="sparkle" size={10} className="icon-gold" /> ~</div>
                    </div>

                    {error && (
                        <div className="gallery-error">{error}</div>
                    )}

                    {canRegenerate && (
                        <button className="gallery-url-btn" onClick={() => setShowUrlInput(true)}>
                            <GameIcon icon="link" size={12} /> Set Image URL
                        </button>
                    )}
                </div>

                {/* Right page: Gallery grid */}
                <div className="book-page book-page-right">
                    <div className="page-corner page-corner-tr"></div>
                    <div className="page-corner page-corner-br"></div>

                    <div className="page-title">
                        <span className="page-title-ornament">⸾</span>
                        Gallery
                        <span className="page-title-ornament">⸾</span>
                    </div>

                    <div className="gallery-grid">
                        {(canRegenerate ? [REGEN_SLOT, ...GENERATION_SLOTS] : GENERATION_SLOTS).map((slot) => {
                            const imageUrl = generatedImages[slot.type];
                            const isLoading = loadingSlot === slot.type;
                            const isAnyLoading = loadingSlot !== null;

                            return (
                                <div key={slot.type} className="gallery-slot">
                                    <div className="gallery-slot-frame">
                                        <div
                                            className={`gallery-slot-image ${imageUrl ? 'has-image' : ''} ${isLoading ? 'loading' : ''}`}
                                            onClick={() => imageUrl && setExpandedImage(imageUrl)}
                                        >
                                            {isLoading && (
                                                <div className="gallery-loading">
                                                    <div className="gallery-spinner"></div>
                                                    <span>Generating...</span>
                                                </div>
                                            )}
                                            {!isLoading && imageUrl && (
                                                <img src={imageUrl} alt={slot.label} />
                                            )}
                                            {!isLoading && !imageUrl && (
                                                <div className="gallery-empty">
                                                    <span className="gallery-empty-icon"><GameIcon icon={slot.icon} size={20} /></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="gallery-slot-label">
                                        <span className="slot-icon"><GameIcon icon={slot.icon} size={12} /></span>
                                        {slot.label}
                                    </div>

                                    <div className="gallery-slot-btns">
                                        {/* Quick generate with default prompt */}
                                        <button
                                            className="gallery-gen-btn"
                                            onClick={() => handleGenerate(slot)}
                                            disabled={isAnyLoading}
                                        >
                                            {isLoading ? <><GameIcon icon="sparkle" size={12} /> Conjuring...</> : imageUrl ? <><GameIcon icon="refresh-cw" size={12} /> Redo</> : <><GameIcon icon="sparkle" size={12} /> Conjure</>}
                                        </button>
                                        {/* Edit prompt before generating (not for bg_removed which has no prompt) */}
                                        {slot.type !== 'bg_removed' && (
                                            <button
                                                className="gallery-edit-btn"
                                                onClick={() => openPromptEditor(slot)}
                                                disabled={isAnyLoading}
                                                title="Edit prompt before generating"
                                            >
                                                <GameIcon icon="pencil" size={10} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
