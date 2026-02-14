import React, { FC, useState } from 'react';
import {
    Stage,
    GalleryImageType,
    GalleryImage,
    GALLERY_SLOTS,
} from '../Stage';

interface CharacterGalleryProps {
    stage: () => Stage;
    characterName: string;
    avatarUrl: string;
    color: string;
    onClose: () => void;
}

// Prompt templates for each hypnosis / outfit type
const GENERATION_PROMPTS: Record<GalleryImageType, { prompt: string; negPrompt: string; strength: number }> = {
    no_background: {
        prompt: '',
        negPrompt: '',
        strength: 0,
    },
    hypno_citrine: {
        prompt: 'golden glowing eyes, drooling, happy trance, hypnotized, blank happy smile, glowing golden irises, spiral eyes, mind controlled, dazed expression',
        negPrompt: 'normal eyes, alert, angry, sad, closed eyes',
        strength: 0.45,
    },
    hypno_julian: {
        prompt: 'blue glowing eyes, blank empty trance, hypnotized, emotionless, glowing blue irises, empty stare, mind controlled, vacant expression, dull',
        negPrompt: 'normal eyes, happy, smiling, alert, angry',
        strength: 0.45,
    },
    hypno_flores: {
        prompt: 'purple glowing eyes, drooling, drained, blushing, horny, hypnotized, glowing purple irises, flushed cheeks, heavy breathing, mind controlled, dazed aroused expression',
        negPrompt: 'normal eyes, alert, angry, calm, composed',
        strength: 0.45,
    },
    outfit_lingerie: {
        prompt: 'wearing lingerie, lace underwear, bra and panties, seductive pose, bedroom setting, intimate clothing',
        negPrompt: 'fully clothed, armor, casual clothes, nude, naked',
        strength: 0.55,
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
                // Use imageToImage for expression/outfit changes
                const config = GENERATION_PROMPTS[type];
                const result = await stage().generator.imageToImage({
                    image: avatarUrl,
                    prompt: config.prompt,
                    strength: config.strength,
                });
                resultUrl = result?.url || null;

                // If hypnosis type, also remove the background from the result
                if (resultUrl && type.startsWith('hypno_')) {
                    try {
                        const bgResult = await stage().generator.removeBackground({ image: resultUrl });
                        if (bgResult?.url) {
                            resultUrl = bgResult.url;
                        }
                    } catch (_) {
                        // Keep the original result if BG removal fails
                    }
                }
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
