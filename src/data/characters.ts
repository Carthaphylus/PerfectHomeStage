import { StatName } from './stats';

// ──────────────────────────────────────────
// CHARACTER DATA & CHUB.AI CONFIG
// ──────────────────────────────────────────

export const CHUB_USER = 'Sauron275';

export const CHUB_CHARACTER_IDS: Record<string, { id: string; slug: string }> = {
    citrine: { id: '9731bb4e10d9', slug: 'citrine' },
    felicity: { id: '79e6007def5a', slug: 'felicity' },
    locke: { id: 'ea98d94e3965', slug: 'locke' },
    sable: { id: '62ce8e0d06a3', slug: 'sable' },
    veridian: { id: 'ef8cef32f1ff', slug: 'the-cleric' },
    kova: { id: '24e3aa6fd485', slug: 'the-barbarian' },
    pervis: { id: '8e93f3bc4f21', slug: 'the-leader' },
};

export function getChubAvatarUrl(characterKey: string): string {
    const char = CHUB_CHARACTER_IDS[characterKey.toLowerCase()];
    if (!char) return '';
    return `https://avatars.charhub.io/avatars/${CHUB_USER}/${char.slug}-${char.id}/chara_card_v2.png`;
}

export const CHUB_AVATARS = {
    citrine: getChubAvatarUrl('citrine'),
    felicity: getChubAvatarUrl('felicity'),
    locke: getChubAvatarUrl('locke'),
    sable: getChubAvatarUrl('sable'),
    veridian: getChubAvatarUrl('veridian'),
    kova: getChubAvatarUrl('kova'),
    pervis: getChubAvatarUrl('pervis'),
};

export const CHARACTER_DATA: Record<string, {
    color: string;
    description: string;
    traits: string[];
    details: Record<string, string>;
    stats: Record<StatName, number>;
}> = {
    Citrine: {
        color: '#8a7abf',
        description: 'A cunning and enigmatic gray cat witch who has claimed dominion over a crumbling manor on the edge of the wilds. Citrine bends the will of wandering heroes to serve his household, weaving subtle enchantments and honeyed words to convert them into loyal servants. His silvery fur and piercing violet eyes belie a mind that is always three steps ahead. Though his methods are questionable, he seeks to restore the manor to its former grandeur — one thrall at a time.',
        traits: ['Enchantress', 'Cunning', 'Ambitious', 'Charismatic', 'Possessive'],
        details: {
            'Species': 'Gray Cat', 'Gender': '♂ Male', 'Class': 'Witch',
            'Affinity': 'Mind Magic', 'Alignment': 'Lawful Evil', 'Goal': 'Restore the manor to glory',
        },
        stats: { prowess: 52, expertise: 45, attunement: 88, presence: 82, discipline: 78, insight: 75 },
    },
    Felicity: {
        color: '#e85d9a',
        description: 'A dainty pink-furred cat with an ever-present smile and an unsettling devotion to his master. Felicity was the first to fall under Citrine\u2019s spell and now serves as the manor\u2019s head handmaiden with frightening efficiency. His bubbly demeanor hides a razor-sharp attention to detail \u2014 nothing escapes his notice, and no dust mote survives his wrath.',
        traits: ['Devoted', 'Meticulous', 'Cheerful', 'Perceptive', 'Territorial'],
        details: {
            'Species': 'Pink Cat', 'Gender': '♂ Male', 'Former Role': 'Handmaiden',
            'Specialty': 'Household Management', 'Loyalty': 'Absolute', 'Quirk': 'Hums while he cleans',
        },
        stats: { prowess: 38, expertise: 85, attunement: 28, presence: 58, discipline: 90, insight: 68 },
    },
    Locke: {
        color: '#6a8caf',
        description: 'A stoic gray fox with steely blue eyes and impeccable posture. Locke serves as the manor\u2019s butler, managing affairs with a quiet efficiency that borders on unnerving. Before falling to Citrine\u2019s enchantments, he was a renowned scout \u2014 skills he now applies to keeping the manor\u2019s perimeter secure and its secrets well hidden. He speaks little, but when he does, every word carries weight.',
        traits: ['Stoic', 'Vigilant', 'Disciplined', 'Resourceful', 'Loyal'],
        details: {
            'Species': 'Gray Fox', 'Gender': '♂ Male', 'Former Role': 'Butler',
            'Specialty': 'Security & Logistics', 'Loyalty': 'Unwavering', 'Quirk': 'Polishes silverware when thinking',
        },
        stats: { prowess: 62, expertise: 72, attunement: 32, presence: 66, discipline: 94, insight: 76 },
    },
    Sable: {
        color: '#c4943a',
        description: 'A quick-witted tabby cat with amber-streaked fur and a cocky grin. Sable earned his reputation as one of the most elusive thieves in the region, slipping through traps and guards with feline grace. He trusts no one fully and keeps a dagger hidden in every pocket. Citrine sees his agility and cunning as perfect servant material \u2014 if he can ever be caught and broken.',
        traits: ['Elusive', 'Witty', 'Distrustful', 'Agile', 'Defiant'],
        details: {
            'Species': 'Tabby Cat', 'Gender': '♂ Male', 'Class': 'Thief',
            'Specialty': 'Stealth & Lockpicking', 'Weakness': 'Overconfidence', 'Quirk': 'Flicks his tail when lying',
        },
        stats: { prowess: 68, expertise: 74, attunement: 24, presence: 60, discipline: 22, insight: 72 },
    },
    Veridian: {
        color: '#4a9e6a',
        description: 'A gentle doe with soft brown fur dappled in pale spots, Veridian radiates a quiet warmth that can mend wounds and ease troubled minds. As a devout cleric of the Forest Shrine, she travels the wilds healing the sick and protecting the innocent. Her compassion may be her greatest strength \u2014 but also the very thing Citrine intends to exploit.',
        traits: ['Compassionate', 'Devout', 'Gentle', 'Stubborn', 'Selfless'],
        details: {
            'Species': 'Deer', 'Gender': '♀ Female', 'Class': 'Cleric',
            'Specialty': 'Healing & Warding', 'Weakness': 'Trusts too easily', 'Quirk': 'Ears twitch when sensing danger',
        },
        stats: { prowess: 42, expertise: 50, attunement: 80, presence: 70, discipline: 65, insight: 74 },
    },
    Kova: {
        color: '#b84a4a',
        description: 'A towering gray wolf with battle scars carved across her muzzle and arms. Kova lives for the thrill of combat and the roar of the crowd. As a barbarian mercenary, she fears nothing \u2014 except boredom. Her raw strength is unmatched, but her impulsive nature leaves her vulnerable to subtler forms of manipulation. Citrine will need more than words to tame this beast.',
        traits: ['Fierce', 'Impulsive', 'Fearless', 'Proud', 'Restless'],
        details: {
            'Species': 'Wolf', 'Gender': '♀ Female', 'Class': 'Barbarian',
            'Specialty': 'Raw Strength & Intimidation', 'Weakness': 'Easily provoked', 'Quirk': 'Howls at the moon involuntarily',
        },
        stats: { prowess: 92, expertise: 32, attunement: 18, presence: 76, discipline: 28, insight: 40 },
    },
    Pervis: {
        color: '#5a6abf',
        description: 'A composed and calculating rabbit with sleek white fur and piercing sapphire eyes. Pervis leads the hero party with a strategic mind and an iron will, always ten moves ahead of any adversary. Beneath the calm exterior lies a fierce determination to protect his companions at any cost. Citrine considers him the most dangerous \u2014 and the most valuable \u2014 prize.',
        traits: ['Strategic', 'Composed', 'Protective', 'Stubborn', 'Charismatic'],
        details: {
            'Species': 'Bunny', 'Gender': '♂ Male', 'Class': 'Leader',
            'Specialty': 'Tactics & Inspiration', 'Weakness': 'Cannot abandon allies', 'Quirk': 'Nose wiggles when plotting',
        },
        stats: { prowess: 58, expertise: 46, attunement: 38, presence: 84, discipline: 70, insight: 82 },
    },
};
