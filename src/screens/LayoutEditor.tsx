import React, { FC, useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// LAYOUT EDITOR
// ============================================================================
// Split into two parts:
//   1. LayoutEditorHandles — drag/resize overlays rendered ON the blueprint
//   2. LayoutEditorPanel  — controls rendered IN the right-side detail panel
// Both share state via props lifted to ManorScreen.
// ============================================================================

export interface LayoutSlot {
    slotId: string;
    floor: string;
    x: number;
    y: number;
    width: number;
    height: number;
    roomType: string | null;
    level?: number;
    occupant?: string;
}

// ─── Shared logic hook ──────────────────────────────────────────────────────

interface UseLayoutEditorArgs {
    slots: LayoutSlot[];
    currentFloor: string;
    blueprintRef: React.RefObject<HTMLDivElement>;
    onSlotsChange: (slots: LayoutSlot[]) => void;
    selectedSlotId: string | null;
    setSelectedSlotId: (id: string | null) => void;
}

type DragMode = 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'resize-r' | 'resize-l' | 'resize-t' | 'resize-b';

function useLayoutEditor({
    slots,
    currentFloor,
    blueprintRef,
    onSlotsChange,
    selectedSlotId,
    setSelectedSlotId,
}: UseLayoutEditorArgs) {
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [gridSize, setGridSize] = useState(1);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const dragRef = useRef<{
        active: boolean;
        mode: DragMode;
        slotId: string;
        startMouseX: number;
        startMouseY: number;
        startSlot: LayoutSlot;
    } | null>(null);

    const floorSlots = slots.filter(s => s.floor === currentFloor);
    const selected = slots.find(s => s.slotId === selectedSlotId) ?? null;

    const snap = useCallback((v: number) => {
        if (!snapToGrid) return Math.round(v * 10) / 10;
        return Math.round(v / gridSize) * gridSize;
    }, [snapToGrid, gridSize]);

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const pxToPercent = useCallback((pxX: number, pxY: number): [number, number] => {
        const el = blueprintRef.current;
        if (!el) return [0, 0];
        const rect = el.getBoundingClientRect();
        return [(pxX / rect.width) * 100, (pxY / rect.height) * 100];
    }, [blueprintRef]);

    const updateSlot = useCallback((slotId: string, patch: Partial<LayoutSlot>) => {
        onSlotsChange(slots.map(s => s.slotId === slotId ? { ...s, ...patch } : s));
    }, [slots, onSlotsChange]);

    const startDrag = useCallback((e: React.MouseEvent, slotId: string, mode: DragMode) => {
        e.preventDefault();
        e.stopPropagation();
        const slot = slots.find(s => s.slotId === slotId);
        if (!slot) return;
        setSelectedSlotId(slotId);
        dragRef.current = {
            active: true, mode, slotId,
            startMouseX: e.clientX, startMouseY: e.clientY,
            startSlot: { ...slot },
        };
        document.body.style.cursor = mode === 'move' ? 'grabbing' : 'nwse-resize';
    }, [slots, setSelectedSlotId]);

    // Mouse move / up
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const d = dragRef.current;
            if (!d || !d.active) return;
            const dx = e.clientX - d.startMouseX;
            const dy = e.clientY - d.startMouseY;
            const [dpx, dpy] = pxToPercent(dx, dy);
            const s = d.startSlot;
            let newX = s.x, newY = s.y, newW = s.width, newH = s.height;

            switch (d.mode) {
                case 'move':
                    newX = snap(clamp(s.x + dpx, 0, 100 - s.width));
                    newY = snap(clamp(s.y + dpy, 0, 100 - s.height));
                    break;
                case 'resize-br':
                    newW = snap(clamp(s.width + dpx, 3, 100 - s.x));
                    newH = snap(clamp(s.height + dpy, 3, 100 - s.y));
                    break;
                case 'resize-bl':
                    newX = snap(clamp(s.x + dpx, 0, s.x + s.width - 3));
                    newW = snap(s.width - (newX - s.x));
                    newH = snap(clamp(s.height + dpy, 3, 100 - s.y));
                    break;
                case 'resize-tr':
                    newW = snap(clamp(s.width + dpx, 3, 100 - s.x));
                    newY = snap(clamp(s.y + dpy, 0, s.y + s.height - 3));
                    newH = snap(s.height - (newY - s.y));
                    break;
                case 'resize-tl':
                    newX = snap(clamp(s.x + dpx, 0, s.x + s.width - 3));
                    newW = snap(s.width - (newX - s.x));
                    newY = snap(clamp(s.y + dpy, 0, s.y + s.height - 3));
                    newH = snap(s.height - (newY - s.y));
                    break;
                case 'resize-r': newW = snap(clamp(s.width + dpx, 3, 100 - s.x)); break;
                case 'resize-l':
                    newX = snap(clamp(s.x + dpx, 0, s.x + s.width - 3));
                    newW = snap(s.width - (newX - s.x));
                    break;
                case 'resize-t':
                    newY = snap(clamp(s.y + dpy, 0, s.y + s.height - 3));
                    newH = snap(s.height - (newY - s.y));
                    break;
                case 'resize-b': newH = snap(clamp(s.height + dpy, 3, 100 - s.y)); break;
            }
            updateSlot(d.slotId, { x: newX, y: newY, width: newW, height: newH });
        };
        const onMouseUp = () => {
            if (dragRef.current) { dragRef.current = null; document.body.style.cursor = ''; }
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
    }, [pxToPercent, updateSlot, snap]);

    // Keyboard nudge
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!selected) return;
            const step = e.shiftKey ? 5 : 1;
            let consumed = true;
            switch (e.key) {
                case 'ArrowLeft':  updateSlot(selected.slotId, { x: snap(clamp(selected.x - step, 0, 100 - selected.width)) }); break;
                case 'ArrowRight': updateSlot(selected.slotId, { x: snap(clamp(selected.x + step, 0, 100 - selected.width)) }); break;
                case 'ArrowUp':    updateSlot(selected.slotId, { y: snap(clamp(selected.y - step, 0, 100 - selected.height)) }); break;
                case 'ArrowDown':  updateSlot(selected.slotId, { y: snap(clamp(selected.y + step, 0, 100 - selected.height)) }); break;
                case 'Delete': case 'Backspace':
                    if (e.target instanceof HTMLInputElement) { consumed = false; break; }
                    onSlotsChange(slots.filter(s => s.slotId !== selected.slotId));
                    setSelectedSlotId(null);
                    break;
                default: consumed = false;
            }
            if (consumed) e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selected, slots, updateSlot, onSlotsChange, setSelectedSlotId, snap]);

    const addSlot = () => {
        const prefix = currentFloor === '1st' ? '1st' : currentFloor === '2nd' ? '2nd' : currentFloor === 'basement' ? 'basement' : 'outside';
        let counter = slots.filter(s => s.floor === currentFloor).length + 1;
        let id = `${prefix}_slot_${counter}`;
        while (slots.some(s => s.slotId === id)) { counter++; id = `${prefix}_slot_${counter}`; }
        const newSlot: LayoutSlot = { slotId: id, floor: currentFloor, x: 10, y: 10, width: 20, height: 20, roomType: null };
        onSlotsChange([...slots, newSlot]);
        setSelectedSlotId(id);
    };

    const duplicateSlot = () => {
        if (!selected) return;
        const prefix = currentFloor === '1st' ? '1st' : currentFloor === '2nd' ? '2nd' : currentFloor === 'basement' ? 'basement' : 'outside';
        let counter = slots.filter(s => s.floor === currentFloor).length + 1;
        let id = `${prefix}_slot_${counter}`;
        while (slots.some(s => s.slotId === id)) { counter++; id = `${prefix}_slot_${counter}`; }
        const dup: LayoutSlot = { ...selected, slotId: id, x: snap(clamp(selected.x + 5, 0, 100 - selected.width)), y: snap(clamp(selected.y + 5, 0, 100 - selected.height)) };
        onSlotsChange([...slots, dup]);
        setSelectedSlotId(id);
    };

    const generateCode = () => {
        const grouped: Record<string, LayoutSlot[]> = {};
        for (const s of slots) { if (!grouped[s.floor]) grouped[s.floor] = []; grouped[s.floor].push(s); }
        const labels: Record<string, string> = { '1st': '1st Floor', '2nd': '2nd Floor', 'basement': 'Basement', 'outside': 'Outside' };
        let code = `    const getDefaultSlots = (): RoomSlot[] => [\n`;
        for (const floor of ['1st', '2nd', 'basement', 'outside']) {
            const fs = grouped[floor];
            if (!fs || !fs.length) continue;
            code += `        // ${labels[floor] || floor} slots\n`;
            for (const s of fs) {
                const parts = [`slotId: '${s.slotId}'`, `floor: '${s.floor}'`, `x: ${s.x}`, `y: ${s.y}`, `width: ${s.width}`, `height: ${s.height}`, `roomType: ${s.roomType ? `'${s.roomType}'` : 'null'}`];
                if (s.level !== undefined && s.roomType) parts.push(`level: ${s.level}`);
                code += `        { ${parts.join(', ')} },\n`;
            }
            code += `        \n`;
        }
        code += `    ];`;
        return code;
    };

    const saveToFile = async () => {
        const code = generateCode();
        setSaveStatus('saving');
        try {
            const res = await fetch('/__update-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (data.ok) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                console.error('Save failed:', data.error);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (err) {
            console.error('Save request failed:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleNumericChange = (field: 'x' | 'y' | 'width' | 'height', value: string) => {
        if (!selected) return;
        const num = parseFloat(value);
        if (isNaN(num)) return;
        updateSlot(selected.slotId, { [field]: Math.round(clamp(num, 0, 100) * 10) / 10 });
    };

    const handleRoomTypeChange = (value: string) => {
        if (!selected) return;
        updateSlot(selected.slotId, { roomType: value === '' ? null : value, level: value ? 1 : undefined });
    };

    return {
        floorSlots, selected, snapToGrid, setSnapToGrid, gridSize, setGridSize, saveStatus,
        startDrag, addSlot, duplicateSlot, saveToFile, handleNumericChange, handleRoomTypeChange,
        updateSlot, clamp, snap,
    };
}

// ─── Handles overlay (rendered inside .rooms-overlay on the blueprint) ──────

interface LayoutEditorHandlesProps {
    slots: LayoutSlot[];
    currentFloor: string;
    blueprintRef: React.RefObject<HTMLDivElement>;
    onSlotsChange: (slots: LayoutSlot[]) => void;
    selectedSlotId: string | null;
    setSelectedSlotId: (id: string | null) => void;
}

export const LayoutEditorHandles: FC<LayoutEditorHandlesProps> = (props) => {
    const { floorSlots, startDrag } = useLayoutEditor(props);
    const { selectedSlotId, setSelectedSlotId } = props;

    return (
        <div className="layout-editor-handles">
            {floorSlots.map(slot => {
                const isSel = slot.slotId === selectedSlotId;
                return (
                    <div
                        key={slot.slotId}
                        className={`le-room ${isSel ? 'le-selected' : ''}`}
                        style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: `${slot.width}%`,
                            height: `${slot.height}%`,
                        }}
                        onMouseDown={e => startDrag(e, slot.slotId, 'move')}
                        onClick={e => { e.stopPropagation(); setSelectedSlotId(slot.slotId); }}
                    >
                        <div className="le-room-label">
                            <span className="le-room-name">{slot.roomType || 'empty'}</span>
                            <span className="le-room-id">{slot.slotId}</span>
                        </div>
                        <div className="le-room-coords">
                            {slot.x},{slot.y} — {slot.width}×{slot.height}
                        </div>
                        {isSel && (
                            <>
                                <div className="le-handle le-handle-tl" onMouseDown={e => startDrag(e, slot.slotId, 'resize-tl')} />
                                <div className="le-handle le-handle-tr" onMouseDown={e => startDrag(e, slot.slotId, 'resize-tr')} />
                                <div className="le-handle le-handle-bl" onMouseDown={e => startDrag(e, slot.slotId, 'resize-bl')} />
                                <div className="le-handle le-handle-br" onMouseDown={e => startDrag(e, slot.slotId, 'resize-br')} />
                                <div className="le-handle le-handle-t" onMouseDown={e => startDrag(e, slot.slotId, 'resize-t')} />
                                <div className="le-handle le-handle-b" onMouseDown={e => startDrag(e, slot.slotId, 'resize-b')} />
                                <div className="le-handle le-handle-l" onMouseDown={e => startDrag(e, slot.slotId, 'resize-l')} />
                                <div className="le-handle le-handle-r" onMouseDown={e => startDrag(e, slot.slotId, 'resize-r')} />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Panel (rendered in place of the room-detail-panel) ─────────────────────

interface LayoutEditorPanelProps {
    slots: LayoutSlot[];
    currentFloor: string;
    blueprintRef: React.RefObject<HTMLDivElement>;
    onSlotsChange: (slots: LayoutSlot[]) => void;
    onClose: () => void;
    onRoomTypeChange?: (slotId: string, roomType: string | null) => void;
    selectedSlotId: string | null;
    setSelectedSlotId: (id: string | null) => void;
}

export const LayoutEditorPanel: FC<LayoutEditorPanelProps> = (props) => {
    const { onClose, onRoomTypeChange } = props;
    const {
        floorSlots, selected, snapToGrid, setSnapToGrid, gridSize, setGridSize, saveStatus,
        addSlot, duplicateSlot, saveToFile, handleNumericChange, handleRoomTypeChange,
    } = useLayoutEditor(props);
    const { slots, onSlotsChange, selectedSlotId, setSelectedSlotId } = props;

    const onRoomTypeDropdownChange = (value: string) => {
        handleRoomTypeChange(value);
        if (selected && onRoomTypeChange) {
            onRoomTypeChange(selected.slotId, value === '' ? null : value);
        }
    };

    return (
        <div className="room-detail-panel visible layout-editor-panel">
            <div className="le-panel-header">
                <h3>Layout Editor</h3>
                <button className="le-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="le-panel-body">
                {/* Tools */}
                <div className="le-section">
                    <div className="le-row">
                        <label className="le-checkbox">
                            <input type="checkbox" checked={snapToGrid} onChange={e => setSnapToGrid(e.target.checked)} />
                            Snap to grid
                        </label>
                        {snapToGrid && (
                            <div className="le-grid-size">
                                <label>Grid:</label>
                                <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))}>
                                    <option value={0.5}>0.5%</option>
                                    <option value={1}>1%</option>
                                    <option value={2}>2%</option>
                                    <option value={5}>5%</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Slot list */}
                <div className="le-section">
                    <h4>Slots on Floor ({floorSlots.length})</h4>
                    <div className="le-slot-list">
                        {floorSlots.map(slot => (
                            <div
                                key={slot.slotId}
                                className={`le-slot-item ${slot.slotId === selectedSlotId ? 'active' : ''}`}
                                onClick={() => setSelectedSlotId(slot.slotId)}
                            >
                                <span className="le-slot-name">{slot.roomType || 'empty'}</span>
                                <span className="le-slot-dims">{slot.x},{slot.y} {slot.width}×{slot.height}</span>
                            </div>
                        ))}
                    </div>
                    <div className="le-slot-actions">
                        <button className="le-btn le-btn-add" onClick={addSlot}>+ Add Slot</button>
                        {selected && <button className="le-btn le-btn-dup" onClick={duplicateSlot}>Duplicate</button>}
                    </div>
                </div>

                {/* Properties */}
                {selected && (
                    <div className="le-section le-props">
                        <h4>Properties — {selected.slotId}</h4>

                        <div className="le-prop-group">
                            <label>Room Type</label>
                            <select value={selected.roomType || ''} onChange={e => onRoomTypeDropdownChange(e.target.value)}>
                                <option value="">empty (null)</option>
                                <optgroup label="── Structural ──">
                                    <option value="your_room">Your Room</option>
                                    <option value="corridor">Corridor</option>
                                    <option value="main_hall">Main Hall</option>
                                </optgroup>
                                <optgroup label="── Buildable ──">
                                    <option value="ritual">Ritual Room</option>
                                    <option value="quarters">Servant Quarters</option>
                                    <option value="classroom">Classroom</option>
                                    <option value="storage">Storage</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="lounge">Lounge</option>
                                    <option value="brewing">Brewing Room</option>
                                    <option value="stable">Stable</option>
                                    <option value="cell">Cell</option>
                                    <option value="dungeon">Dungeon</option>
                                </optgroup>
                                <optgroup label="── Decorative ──">
                                    <option value="wardrobe">Wardrobe</option>
                                    <option value="bathroom">Bathroom</option>
                                    <option value="hallway_nook">Hallway Nook</option>
                                    <option value="library">Library</option>
                                    <option value="gallery">Gallery</option>
                                    <option value="balcony">Balcony</option>
                                    <option value="fountain">Fountain</option>
                                    <option value="garden">Garden</option>
                                    <option value="trophy_room">Trophy Room</option>
                                    <option value="stairway">Stairway</option>
                                    <option value="terrace">Terrace</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="le-prop-row">
                            <div className="le-prop-group">
                                <label>X (%)</label>
                                <input type="number" step={gridSize} min={0} max={100} value={selected.x} onChange={e => handleNumericChange('x', e.target.value)} />
                            </div>
                            <div className="le-prop-group">
                                <label>Y (%)</label>
                                <input type="number" step={gridSize} min={0} max={100} value={selected.y} onChange={e => handleNumericChange('y', e.target.value)} />
                            </div>
                        </div>

                        <div className="le-prop-row">
                            <div className="le-prop-group">
                                <label>Width (%)</label>
                                <input type="number" step={gridSize} min={1} max={100} value={selected.width} onChange={e => handleNumericChange('width', e.target.value)} />
                            </div>
                            <div className="le-prop-group">
                                <label>Height (%)</label>
                                <input type="number" step={gridSize} min={1} max={100} value={selected.height} onChange={e => handleNumericChange('height', e.target.value)} />
                            </div>
                        </div>

                        <div className="le-prop-group">
                            <label>Slot ID</label>
                            <input
                                type="text"
                                value={selected.slotId}
                                onChange={e => {
                                    const newId = e.target.value;
                                    if (!newId || slots.some(s => s.slotId === newId && s.slotId !== selected.slotId)) return;
                                    onSlotsChange(slots.map(s => s.slotId === selected.slotId ? { ...s, slotId: newId } : s));
                                    setSelectedSlotId(newId);
                                }}
                            />
                        </div>

                        <button
                            className="le-btn le-btn-delete"
                            onClick={() => { onSlotsChange(slots.filter(s => s.slotId !== selected.slotId)); setSelectedSlotId(null); }}
                        >
                            Delete Slot
                        </button>
                    </div>
                )}

                {/* Hints */}
                <div className="le-section le-hints">
                    <h4>Shortcuts</h4>
                    <ul>
                        <li><kbd>Arrow keys</kbd> — Nudge 1%</li>
                        <li><kbd>Shift + Arrows</kbd> — Nudge 5%</li>
                        <li><kbd>Delete</kbd> — Remove slot</li>
                        <li>Drag center — Move</li>
                        <li>Drag handles — Resize</li>
                    </ul>
                </div>
            </div>

            {/* Save to file button */}
            <div className="le-panel-footer">
                <button
                    className={`le-btn le-btn-copy ${saveStatus === 'saved' ? 'copied' : ''} ${saveStatus === 'error' ? 'error' : ''}`}
                    onClick={saveToFile}
                    disabled={saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error — retry?' : 'Save to Code'}
                </button>
            </div>
        </div>
    );
};
