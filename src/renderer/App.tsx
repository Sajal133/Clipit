import React, { useEffect, useState, useMemo } from 'react';

interface ClipboardItem {
    id: number;
    type: 'text' | 'image';
    content?: string;
    imageData?: Uint8Array;
    timestamp: number;
    preview: string;
}

// Extend Window interface to include our Electron API
declare global {
    interface Window {
        electronAPI: {
            getItems: () => Promise<ClipboardItem[]>;
            selectItem: (id: number) => void;
            deleteItem: (id: number) => void;
            onItemsUpdated: (callback: () => void) => () => void;
            // Settings methods
            getSettings: () => Promise<{ globalShortcut: string; historyLimit: number; launchAtStartup: boolean; }>;
            updateSettings: (settings: { globalShortcut: string; historyLimit: number; launchAtStartup: boolean; }) => void;
            clearHistory: () => void;
        };
    }
}

function App() {
    const [items, setItems] = useState<ClipboardItem[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filter items based on search query (memoized)
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();

            // Search in text content or preview
            if (item.type === 'text') {
                return item.content?.toLowerCase().includes(query) ||
                    item.preview.toLowerCase().includes(query);
            }
            // For images, search in preview (which contains size info)
            return item.preview.toLowerCase().includes(query);
        });
    }, [items, searchQuery]);

    // Load items on mount
    useEffect(() => {
        loadItems();

        // Listen for updates
        const unsubscribe = window.electronAPI.onItemsUpdated(() => {
            loadItems();
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept keys if user is typing in search input
            const target = e.target as HTMLElement;
            const isSearchInput = target.tagName === 'INPUT' && target.classList.contains('search-input');

            // Number keys 1-9 (use filtered items)
            if (e.key >= '1' && e.key <= '9' && !isSearchInput) {
                const index = parseInt(e.key) - 1;
                if (filteredItems[index]) {
                    selectItem(filteredItems[index]);
                }
                e.preventDefault();
            }
            // Delete key (use filtered items)
            else if ((e.key === 'Delete' || e.key === 'Backspace') && !isSearchInput) {
                if (hoveredIndex !== null && filteredItems[hoveredIndex]) {
                    deleteItem(filteredItems[hoveredIndex]);
                    e.preventDefault();
                }
            }
            // Escape to close
            else if (e.key === 'Escape') {
                // Use IPC to hide window instead of window.close()
                window.electronAPI.selectItem(-1); // Signal to hide without selecting
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredItems, hoveredIndex]);

    const loadItems = async () => {
        try {
            const data = await window.electronAPI.getItems();
            setItems(data); // Show all items (keyboard shortcuts 1-9 still work for first 9)
        } catch (error) {
            console.error('Failed to load items:', error);
        }
    };

    const selectItem = (item: ClipboardItem) => {
        window.electronAPI.selectItem(item.id);
    };

    const deleteItem = (item: ClipboardItem) => {
        window.electronAPI.deleteItem(item.id);
    };

    const formatTimestamp = (ts: number) => {
        const diff = Date.now() - ts;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const renderImage = (imageData: Uint8Array) => {
        try {
            // Convert Uint8Array to base64 more efficiently
            const binary = Array.from(imageData, byte => String.fromCharCode(byte)).join('');
            const base64 = window.btoa(binary);
            return `data:image/png;base64,${base64}`;
        } catch (error) {
            console.error('Failed to render image:', error);
            return '';
        }
    };


    if (items.length === 0) {
        return (
            <div className="overlay">
                <div className="header">
                    <h1>Clipboard History</h1>
                </div>
                <div className="empty-state">
                    <p>📋</p>
                    <p>No items yet</p>
                    <p className="hint">Copy something to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overlay">
            <div className="header">
                <h1>Clipboard History</h1>
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search clipboard..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    {searchQuery && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                <button className="close-btn" onClick={() => window.electronAPI.selectItem(-1)}>×</button>
            </div>

            <div className="items-list">
                {filteredItems.map((item, index) => (
                    <div
                        key={item.id}
                        className={`clipboard-item ${index === hoveredIndex ? 'hovered' : ''}`}
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="item-number">{index + 1}</div>

                        <div className="item-content">
                            {item.type === 'text' ? (
                                <div className="text-preview">{item.preview}</div>
                            ) : (
                                <div className="image-preview">
                                    {item.imageData && (
                                        <img
                                            src={renderImage(item.imageData)}
                                            alt="Clipboard"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            )}

                            <div className="item-meta">
                                {formatTimestamp(item.timestamp)} • {item.type}
                            </div>
                        </div>

                        <button
                            className="delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteItem(item);
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                            }}
                            title="Delete (Del key)"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <div className="footer">
                <span>{filteredItems.length} {searchQuery ? `of ${items.length}` : ''} items</span>
                <span className="hint">Press 1-{Math.min(filteredItems.length, 9)} • Del to remove • Esc to close</span>
            </div>
        </div>
    );
}

export default App;
