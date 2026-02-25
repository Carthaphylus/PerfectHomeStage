import React, { FC, useState, useMemo } from 'react';
import type { Stage } from '../Stage';
import type { MessageStateType } from '../data';
import { GameIcon } from './GameIcon';
import {
    ItemType,
    ItemDefinition,
    getAllItemDefinitions,
    getRarityColor,
    getItemRecipe,
    canCraftItem,
    getItemDefinition,
} from '../data/items';

interface ItemLibraryProps {
    stage: () => Stage;
    onClose: () => void;
}

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
    equipment: 'Equipment',
    consumable: 'Consumable',
    material: 'Material',
    key: 'Key Item',
    currency: 'Currency',
};

const ITEM_TYPE_ICONS: Record<ItemType, string> = {
    equipment: 'gem',
    consumable: 'flask',
    material: 'diamond',
    key: 'key',
    currency: 'coins',
};

const TYPE_ORDER: ItemType[] = ['equipment', 'consumable', 'material', 'key', 'currency'];

export const ItemLibrary: FC<ItemLibraryProps> = ({ stage, onClose }) => {
    const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'rarity'>('name');

    const state = stage().currentState as MessageStateType;
    const inventory = state.inventory || {};

    const allItems = useMemo(() => getAllItemDefinitions(), []);

    const filteredItems = useMemo(() => {
        let items = [...allItems];
        if (filterType !== 'all') {
            items = items.filter(item => item.type === filterType);
        }
        if (sortBy === 'name') {
            items.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
            items.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
        }
        return items;
    }, [allItems, filterType, sortBy]);

    const itemsByType = useMemo(() => {
        const grouped: Partial<Record<ItemType, ItemDefinition[]>> = {};
        filteredItems.forEach(item => {
            if (!grouped[item.type]) grouped[item.type] = [];
            grouped[item.type]!.push(item);
        });
        return TYPE_ORDER
            .filter(t => grouped[t] && grouped[t]!.length > 0)
            .map(t => [t, grouped[t]!] as [ItemType, ItemDefinition[]]);
    }, [filteredItems]);

    const selectedItem = selectedItemName
        ? allItems.find(item => item.name === selectedItemName) ?? null
        : null;

    const recipe = selectedItem ? getItemRecipe(selectedItem.name) : null;
    const canCraft = selectedItem ? canCraftItem(selectedItem.name, inventory) : false;
    const ownedQty = inventory[selectedItemName || '']?.quantity ?? 0;

    return (
        <div className="item-library-screen">
            {/* Header */}
            <div className="screen-header">
                <button className="back-button" onClick={onClose}>&lt; Back</button>
                <h2><GameIcon icon="book-open" size={13} /> Item Library</h2>
                <div className="header-spacer" />
            </div>

            {/* Filters */}
            <div className="ilib-filters">
                <div className="ilib-type-filters">
                    <button
                        className={`ilib-filter-btn ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >All</button>
                    {TYPE_ORDER.map(type => (
                        <button
                            key={type}
                            className={`ilib-filter-btn ${filterType === type ? 'active' : ''}`}
                            onClick={() => setFilterType(type)}
                        >
                            <GameIcon icon={ITEM_TYPE_ICONS[type]} size={10} /> {ITEM_TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
                <div className="ilib-sort">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'rarity')}>
                        <option value="name">A–Z</option>
                        <option value="rarity">Rarity</option>
                    </select>
                </div>
            </div>

            {/* Body */}
            <div className="ilib-body">
                {/* Item Grid */}
                <div className="ilib-grid-area">
                    {itemsByType.map(([typeKey, items]) => (
                        <div key={typeKey} className="ilib-type-group">
                            <div className="ilib-type-label">
                                <GameIcon icon={ITEM_TYPE_ICONS[typeKey]} size={10} />
                                <span>{ITEM_TYPE_LABELS[typeKey]}</span>
                                <span className="ilib-type-count">{items.length}</span>
                            </div>
                            <div className="ilib-items-grid">
                                {items.map(item => {
                                    const isSelected = selectedItemName === item.name;
                                    const owned = inventory[item.name]?.quantity ?? 0;
                                    return (
                                        <div
                                            key={item.name}
                                            className={`ilib-card ${isSelected ? 'selected' : ''}`}
                                            style={{ '--rarity-color': getRarityColor(item.rarity) } as React.CSSProperties}
                                            onClick={() => setSelectedItemName(item.name)}
                                        >
                                            <div className="ilib-card-icon">
                                                <GameIcon icon={item.icon} size={20} />
                                            </div>
                                            <div className="ilib-card-name">{item.name}</div>
                                            <div className={`ilib-card-rarity rarity-${item.rarity}`}>
                                                {item.rarity}
                                            </div>
                                            {owned > 0 && (
                                                <div className="ilib-card-owned">×{owned}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                <div className="ilib-detail-panel">
                    {selectedItem ? (
                        <>
                            <div className="ilib-detail-header" style={{ '--rarity-color': getRarityColor(selectedItem.rarity) } as React.CSSProperties}>
                                <span className="ilib-detail-icon">
                                    <GameIcon icon={selectedItem.icon} size={28} />
                                </span>
                                <div className="ilib-detail-title-group">
                                    <span className="ilib-detail-name" style={{ color: getRarityColor(selectedItem.rarity) }}>
                                        {selectedItem.name}
                                    </span>
                                    <span className={`ilib-detail-rarity rarity-${selectedItem.rarity}`}>
                                        {selectedItem.rarity}
                                    </span>
                                </div>
                            </div>

                            <div className="ilib-detail-type">{ITEM_TYPE_LABELS[selectedItem.type]}</div>
                            <p className="ilib-detail-desc">{selectedItem.description}</p>

                            <div className="ilib-detail-meta">
                                <div className="ilib-detail-row">
                                    <span className="ilib-detail-label">Stackable</span>
                                    <span className="ilib-detail-value">{selectedItem.stackable ? `Yes (${selectedItem.maxStack})` : 'No'}</span>
                                </div>
                                <div className="ilib-detail-row">
                                    <span className="ilib-detail-label">Owned</span>
                                    <span className="ilib-detail-value" style={{ color: ownedQty > 0 ? '#5dba5d' : 'var(--text-muted)' }}>
                                        {ownedQty}
                                    </span>
                                </div>
                            </div>

                            {selectedItem.craftable && recipe && (
                                <div className="ilib-recipe">
                                    <div className="ilib-recipe-header">
                                        <GameIcon icon="flask" size={10} />
                                        <span>Crafting Recipe</span>
                                        <span className={`ilib-recipe-badge ${canCraft ? 'can-craft' : 'no-craft'}`}>
                                            {canCraft ? '✓ Craftable' : '✗ Missing'}
                                        </span>
                                    </div>
                                    <div className="ilib-recipe-list">
                                        {recipe.ingredients.map((ing, idx) => {
                                            const have = inventory[ing.itemName]?.quantity ?? 0;
                                            const ok = have >= ing.quantity;
                                            const ingDef = getItemDefinition(ing.itemName);
                                            return (
                                                <div key={idx} className={`ilib-recipe-row ${ok ? 'satisfied' : 'unsatisfied'}`}>
                                                    <GameIcon icon={ingDef.icon} size={12} />
                                                    <span className="ilib-recipe-name">{ing.itemName}</span>
                                                    <span className={`ilib-recipe-qty ${ok ? 'qty-ok' : 'qty-no'}`}>
                                                        {have}/{ing.quantity}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!selectedItem.craftable && (
                                <div className="ilib-no-recipe">Cannot be crafted</div>
                            )}
                        </>
                    ) : (
                        <div className="ilib-empty-detail">
                            <GameIcon icon="book-open" size={32} color="rgba(200,170,110,0.2)" />
                            <p>Select an item to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
