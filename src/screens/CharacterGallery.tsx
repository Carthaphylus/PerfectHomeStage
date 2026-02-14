import React, { FC, useState } from 'react';
import { Stage } from '../Stage';

// Generation slot types
export type GenerationSlotType =
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
        icon: '🖼️',
    },
    {
        type: 'hypno_citrine',
        label: 'Citrine\u2019s Trance',
        description: 'Golden glowing eyes, drooling, happy trance',
        icon: '✨',
    },
    {
        type: 'hypno_julian',
        label: 'Julian\u2019s Trance',
        description: 'Blue glowing eyes, blank and empty trance',
        icon: '💎',
    },
    {
        type: 'hypno_flores',
        label: 'Flores\u2019s Trance',
        description: 'Purple glowing eyes, drooling, drained, blushing',
        icon: '🌸',
    },
    {
        type: 'outfit_lingerie',
        label: 'Lingerie',
        description: 'Character in lingerie outfit',
        icon: '👙',
    },
];

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
    onClose: () => void;
}

export const CharacterGallery: FC<CharacterGalleryProps> = ({
    stage,
    charName,
    charAvatar,
    charSpecies,
    charColor,
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

    const handleGenerate = async (slot: GenerationSlot) => {
        setLoadingSlot(slot.type);
        setError(null);

        try {
            const gen = stage().generator;

            if (slot.type === 'bg_removed') {
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
                const prompt = buildPrompt(slot.type, charName, charSpecies);

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

    return (
        <div className="char-gallery-overlay" style={{ '--char-color': charColor } as React.CSSProperties}>
            {/* Expanded image viewer */}
            {expandedImage && (
                <div className="gallery-lightbox" onClick={() => setExpandedImage(null)}>
                    <img src={expandedImage} alt="Expanded" />
                    <div className="lightbox-close">✕</div>
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
                        <span className="back-arrow">◀</span>
                        <span className="back-label">Return</span>
                    </button>

                    <div className="book-portrait">
                        <img src={charAvatar} alt={charName} />
                    </div>

                    <div className="book-title-area">
                        <div className="book-ornament">~ ✦ ~</div>
                        <h3 className="book-char-name">{charName}</h3>
                        <div className="book-subtitle">{charSpecies}</div>
                        <div className="book-ornament">~ ✦ ~</div>
                    </div>

                    {error && (
                        <div className="gallery-error">{error}</div>
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
                        {GENERATION_SLOTS.map((slot) => {
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
                                                    <span className="gallery-empty-icon">{slot.icon}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="gallery-slot-label">
                                        <span className="slot-icon">{slot.icon}</span>
                                        {slot.label}
                                    </div>

                                    <button
                                        className="gallery-gen-btn"
                                        onClick={() => handleGenerate(slot)}
                                        disabled={isAnyLoading}
                                    >
                                        {isLoading ? '✦ Conjuring...' : imageUrl ? '↻ Redo' : '✦ Conjure'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
