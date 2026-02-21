import React, { FC, useState } from 'react';
import { ScreenType } from './BaseScreen';
import { Stage, InventoryItem, getItemDefinition, getRarityColor, ItemType } from '../Stage';
import { GameIcon } from './GameIcon';

interface InventoryScreenProps {
    stage: () => Stage;
    setScreenType: (type: ScreenType) => void;
}

const TYPE_FILTERS: { label: string; value: ItemType | 'all'; icon?: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Equipment', value: 'equipment', icon: 'swords' },
    { label: 'Consumable', value: 'consumable', icon: 'test-tubes' },
    { label: 'Material', value: 'material', icon: 'diamond' },
    { label: 'Key', value: 'key', icon: 'key' },
    { label: 'Currency', value: 'currency', icon: 'coins' },
];

export const InventoryScreen: FC<InventoryScreenProps> = ({ stage, setScreenType }) => {
    const items = Object.values(stage().currentState.inventory);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<ItemType | 'all'>('all');

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => {
            const def = getItemDefinition(item.name);
            return def.type === filter;
        });

    const selectedDef = selectedItem ? getItemDefinition(selectedItem.name) : null;

    return (
        <div className="inventory-screen">
            <div className="screen-header">
                <button className="back-button" onClick={() => setScreenType(ScreenType.MENU)}>
                    &lt; Menu
                </button>
                <h2>Inventory</h2>
                <div className="header-spacer"></div>
            </div>

            <div className="inventory-filters">
                {TYPE_FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={`inv-filter-btn ${filter === f.value ? 'active' : ''}`}
                        onClick={() => setFilter(f.value)}
                    >
                        {f.icon && <GameIcon icon={f.icon} size={12} />} {f.label}
                    </button>
                ))}
            </div>

            <div className="inventory-layout">
                <div className="inventory-grid">
                    {filteredItems.length === 0 ? (
                        <div className="empty-message">No items found...</div>
                    ) : (
                        filteredItems.map((item) => {
                            const def = getItemDefinition(item.name);
                            const rarityColor = getRarityColor(def.rarity);
                            const isSelected = selectedItem?.name === item.name;
                            return (
                                <div
                                    key={item.name}
                                    className={`inv-item-card ${isSelected ? 'selected' : ''}`}
                                    style={{ '--rarity-color': rarityColor } as React.CSSProperties}
                                    onClick={() => setSelectedItem(isSelected ? null : item)}
                                >
                                    <div className="inv-item-icon"><GameIcon icon={def.icon} size={20} /></div>
                                    <div className="inv-item-name">{def.name}</div>
                                    {item.quantity > 1 && (
                                        <div className="inv-item-qty">×{item.quantity}</div>
                                    )}
                                    <div className={`inv-item-rarity rarity-${def.rarity}`}>
                                        {def.rarity}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {selectedDef && selectedItem && (
                    <div className="inv-detail-panel" style={{ '--rarity-color': getRarityColor(selectedDef.rarity) } as React.CSSProperties}>
                        <div className="inv-detail-header">
                            <span className="inv-detail-icon"><GameIcon icon={selectedDef.icon} size={20} /></span>
                            <div className="inv-detail-title-group">
                                <span className="inv-detail-name" style={{ color: getRarityColor(selectedDef.rarity) }}>
                                    {selectedDef.name}
                                </span>
                                <span className={`inv-detail-rarity rarity-${selectedDef.rarity}`}>
                                    {selectedDef.rarity}
                                </span>
                            </div>
                        </div>
                        <div className="inv-detail-type">{selectedDef.type}</div>
                        <p className="inv-detail-desc">{selectedDef.description}</p>
                        <div className="inv-detail-meta">
                            <div className="inv-detail-row">
                                <span className="inv-detail-label">Quantity</span>
                                <span className="inv-detail-value">{selectedItem.quantity}</span>
                            </div>
                            {selectedDef.stackable && (
                                <div className="inv-detail-row">
                                    <span className="inv-detail-label">Max Stack</span>
                                    <span className="inv-detail-value">{selectedDef.maxStack}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
