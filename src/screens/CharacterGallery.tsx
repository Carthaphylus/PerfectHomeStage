import React, { FC, useState } from 'react';
import { AspectRatio } from '@chub-ai/stages-ts';
import {
    Stage,
    GalleryImageType,
    GalleryImage,
    GALLERY_SLOTS,
    CHARACTER_DATA,
} from '../Stage';

interface CharacterGalleryProps {
    stage: () => Stage;
    characterName: string;
    avatarUrl: string;
    color: string;
    onClose: () => void;
}

// Base appearance descriptions per character (for text-to-image)
const CHARACTER_APPEARANCE: Record<string, string> = {
    Citrine: 'anthro gray cat male, silvery fur, short messy blonde hair, piercing violet eyes, wearing brown coat over white shirt with black tie, khaki shorts, witch aesthetic, anime style',
    Felicity: 'anthro pink cat female, pink fur, long pink hair, bright cheerful eyes, maid outfit, dainty, bubbly expression, anime style',
    Locke: 'anthro gray fox male, gray fur, steely blue eyes, impeccable posture, butler uniform, stoic expression, anime style',
    Sable: 'anthro tabby cat male, amber-streaked brown fur, amber eyes, cocky grin, thief outfit, leather gear, agile build, anime style',
    Veridian: 'anthro deer female, soft brown fur with pale spots, gentle doe, cleric robes, white and green outfit, kind eyes, anime style',
    Kova: 'anthro wolf female, gray fur, battle scars on muzzle, fierce expression, barbarian armor, muscular build, anime style',
    Pervis: 'anthro rabbit male, sleek white fur, sapphire blue eyes, composed expression, leader uniform, strategic demeanor, anime style',
};

// Effect modifiers for each generation type
const EFFECT_MODIFIERS: Record<Exclude<GalleryImageType, 'no_background'>, { suffix: string; negPrompt: string }> = {
    hypno_citrine: {
        suffix: ', golden glowing eyes, drooling, happy trance, hypnotized, blank happy smile, glowing golden irises, mind controlled, dazed blissful expression, swirly eyes',
        negPrompt: 'normal eyes, alert, angry, sad',
    },
    hypno_julian: {
        suffix: ', blue glowing eyes, blank empty trance, hypnotized, emotionless, glowing blue irises, empty stare, mind controlled, vacant expression, dull lifeless gaze',
        negPrompt: 'normal eyes, happy, smiling, alert',
    },
    hypno_flores: {
        suffix: ', purple glowing eyes, drooling, drained, blushing, hypnotized, glowing purple irises, flushed cheeks, heavy breathing, mind controlled, dazed aroused expression',
        negPrompt: 'normal eyes, alert, calm, composed',
    },
    outfit_lingerie: {
        suffix: ', wearing lace lingerie, bra and panties, seductive pose, bedroom setting, intimate clothing, alluring',
        negPrompt: 'fully clothed, armor, casual clothes, nude',
    },
};

export const CharacterGallery: FC<CharacterGalleryProps> = ({ stage, characterName, avatarUrl, color, onClose }) => {
    // Get existing gallery images from chat state
    const gallery = stage().chatState.characterGallery || {};
    const charImages: GalleryImage[] = gallery[characterName] || [];

    // Track generation status per slot
    const [genStatus, setGenStatus] = useState<Record<GalleryImageType, 'idle' | 'loading' | 'done' | 'error'>>({
        no_background: 'idle',
        hypno_citrine: 'idle',
        hypno_julian: 'idle',
        hypno_flores: 'idle',
        outfit_lingerie: 'idle',
    });
    const [genErrors, setGenErrors] = useState<Record<string, string>>({});
    // Local URL cache for newly generated images (before state refresh)
    const [localUrls, setLocalUrls] = useState<Record<string, string>>({});

    const getImageForType = (type: GalleryImageType): string | null => {
        // Check local cache first (just generated this session)
        if (localUrls[type]) return localUrls[type];
        // Check persisted gallery
        const existing = charImages.find(img => img.type === type);
        return existing?.url || null;
    };

    const saveImageToGallery = (type: GalleryImageType, url: string) => {
        const currentGallery = stage().chatState.characterGallery || {};
        const currentCharImages = currentGallery[characterName] || [];

        // Replace if exists, or add new
        const filtered = currentCharImages.filter(img => img.type !== type);
        filtered.push({ type, url, generatedAt: Date.now() });

        stage().chatState.characterGallery = {
            ...currentGallery,
            [characterName]: filtered,
        };
    };

    const handleGenerate = async (type: GalleryImageType) => {
        setGenStatus(prev => ({ ...prev, [type]: 'loading' }));
        setGenErrors(prev => ({ ...prev, [type]: '' }));

        try {
            let resultUrl: string | null = null;
            const itemId = `gallery_${characterName}_${type}`;

            if (type === 'no_background') {
                // Use dedicated removeBackground API
                const result = await stage().generator.removeBackground({ image: avatarUrl });
                resultUrl = result?.url || null;
            } else {
                // Use text-to-image with character appearance + effect modifiers
                const baseAppearance = CHARACTER_APPEARANCE[characterName] || `anthro ${characterName}, anime style`;
                const modifier = EFFECT_MODIFIERS[type as Exclude<GalleryImageType, 'no_background'>];
                const fullPrompt = baseAppearance + modifier.suffix + ', portrait, high quality, detailed';

                const result = await stage().generator.makeImage({
                    prompt: fullPrompt,
                    negative_prompt: modifier.negPrompt + ', low quality, blurry, deformed',
                    aspect_ratio: AspectRatio.PHOTO_VERTICAL,
                    remove_background: type.startsWith('hypno_'),
                });
                resultUrl = result?.url || null;
            }

            if (resultUrl) {
                setLocalUrls(prev => ({ ...prev, [type]: resultUrl! }));
                saveImageToGallery(type, resultUrl);
                setGenStatus(prev => ({ ...prev, [type]: 'done' }));
            } else {
                setGenErrors(prev => ({ ...prev, [type]: 'No result returned.' }));
                setGenStatus(prev => ({ ...prev, [type]: 'error' }));
            }
        } catch (err: any) {
            setGenErrors(prev => ({ ...prev, [type]: err?.message || 'Generation failed.' }));
            setGenStatus(prev => ({ ...prev, [type]: 'error' }));
        }
    };

    return (
        <div className="char-gallery-overlay" style={{ '--char-color': color } as React.CSSProperties}>
            <div className="char-gallery-panel">
                <div className="gallery-header">
                    <button className="back-button" onClick={onClose}>&lt; Back</button>
                    <h3>{characterName}&rsquo;s Gallery</h3>
                    <div className="header-spacer"></div>
                </div>

                <div className="gallery-grid">
                    {/* Original avatar slot */}
                    <div className="gallery-slot">
                        <div className="gallery-slot-label">Original</div>
                        <div className="gallery-image-frame">
                            <img src={avatarUrl} alt={`${characterName} original`} />
                        </div>
                        <div className="gallery-slot-desc">Base character portrait</div>
                    </div>

                    {/* Generation slots */}
                    {GALLERY_SLOTS.map(slot => {
                        const imageUrl = getImageForType(slot.type);
                        const status = genStatus[slot.type];
                        const error = genErrors[slot.type];

                        return (
                            <div key={slot.type} className="gallery-slot">
                                <div className="gallery-slot-label">
                                    <span className="gallery-slot-icon">{slot.icon}</span>
                                    {slot.label}
                                </div>
                                <div className={`gallery-image-frame ${!imageUrl ? 'empty' : ''}`}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={`${characterName} ${slot.label}`} />
                                    ) : status === 'loading' ? (
                                        <div className="gallery-placeholder loading">
                                            <div className="gallery-spinner"></div>
                                            <span>Generating...</span>
                                        </div>
                                    ) : status === 'error' ? (
                                        <div className="gallery-placeholder error">
                                            <span>{error || 'Error'}</span>
                                        </div>
                                    ) : (
                                        <div className="gallery-placeholder">
                                            <span className="gallery-placeholder-icon">{slot.icon}</span>
                                            <span>Not generated</span>
                                        </div>
                                    )}
                                </div>
                                <div className="gallery-slot-desc">{slot.description}</div>
                                <button
                                    className="gallery-gen-btn"
                                    onClick={() => handleGenerate(slot.type)}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading'
                                        ? 'Generating...'
                                        : imageUrl
                                            ? 'Regenerate'
                                            : 'Generate'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
