import { BrowserWindow } from 'electron';
import path from 'path';

let settingsWindow: BrowserWindow | null = null;

export function createSettingsWindow(): BrowserWindow {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return settingsWindow;
    }

    settingsWindow = new BrowserWindow({
        width: 500,
        height: 600,
        resizable: false,
        frame: true,
        title: 'Clipit Settings',
        backgroundColor: '#1a1a1a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js')
        }
    });

    settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });

    return settingsWindow;
}

export function getSettingsWindow(): BrowserWindow | null {
    return settingsWindow;
}
