import React, { useState, useEffect } from 'react';

interface SettingsData {
    globalShortcut: string;
    historyLimit: number;
    launchAtStartup: boolean;
}

export default function SettingsComponent() {
    const [settings, setSettings] = useState<SettingsData>({
        globalShortcut: 'CommandOrControl+Shift+V',
        historyLimit: 50,
        launchAtStartup: true
    });

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await (window as any).electronAPI.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleSave = () => {
        (window as any).electronAPI.updateSettings(settings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear all clipboard history?')) {
            (window as any).electronAPI.clearHistory();
        }
    };

    const formatShortcut = (shortcut: string): string => {
        // Convert Electron shortcut format to readable format
        return shortcut
            .replace('CommandOrControl', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
            .replace('Command', '⌘')
            .replace('Control', 'Ctrl')
            .replace('Shift', 'Shift')
            .replace('Alt', 'Alt')
            .replace(/\+/g, ' + ');
    };

    return (
        <div className="settings-window">
            <div className="settings-header">
                <h1>Settings</h1>
            </div>

            <div className="settings-content">
                <div className="setting-group">
                    <label>Global Shortcut</label>
                    <input
                        type="text"
                        value={formatShortcut(settings.globalShortcut)}
                        readOnly
                        placeholder="⌘ + Shift + V"
                    />
                    <p className="setting-hint">Press the key combination you want to use</p>
                </div>

                <div className="setting-group">
                    <label>History Limit</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="10"
                            max="250"
                            value={settings.historyLimit}
                            onChange={(e) => setSettings({ ...settings, historyLimit: parseInt(e.target.value) })}
                            style={{
                                background: `linear-gradient(to right, #6750a4 0%, #6750a4 ${((settings.historyLimit - 10) / (250 - 10)) * 100}%, #464646 ${((settings.historyLimit - 10) / (250 - 10)) * 100}%, #464646 100%)`
                            }}
                        />
                        <input
                            type="number"
                            min="10"
                            max="250"
                            value={settings.historyLimit}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 10;
                                setSettings({ ...settings, historyLimit: Math.min(250, Math.max(10, val)) });
                            }}
                            className="number-input"
                        />
                        <span className="slider-label">items</span>
                    </div>
                    <p className="setting-hint">Maximum number of items to keep in history (10-250)</p>
                </div>

                <div className="setting-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={settings.launchAtStartup}
                            onChange={(e) => setSettings({ ...settings, launchAtStartup: e.target.checked })}
                        />
                        <span>Launch at startup</span>
                    </label>
                    <p className="setting-hint">Automatically start Clipit when you log in</p>
                </div>

                <div className="setting-group danger-zone">
                    <label>Danger Zone</label>
                    <button className="danger-btn" onClick={handleClearHistory}>
                        Clear All History
                    </button>
                    <p className="setting-hint">This action cannot be undone</p>
                </div>
            </div>

            <div className="settings-footer">
                <button className="save-btn" onClick={handleSave}>
                    {isSaved ? '✓ Saved!' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
