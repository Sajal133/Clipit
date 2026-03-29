import { ipcMain, BrowserWindow, clipboard, nativeImage, app } from 'electron';
import { dbService } from './database';
import { reRegisterShortcuts } from './shortcuts';

export function setupIPC(overlayWindow: BrowserWindow): void {
    // Get recent clipboard items — now uses configured historyLimit
    ipcMain.handle('get-items', async () => {
        const items = dbService.getRecentItems();
        return items;
    });

    // Select item - copy to clipboard and close window
    // Now uses direct DB lookup by ID instead of fetching all items
    ipcMain.on('select-item', (_, itemId: number) => {
        // Special case: -1 means just hide window (from Escape key)
        if (itemId === -1) {
            overlayWindow.hide();
            return;
        }

        const item = dbService.getItemById(itemId);

        if (item) {
            if (item.type === 'text' && item.content) {
                clipboard.writeText(item.content);
                console.log(`✅ Copied text to clipboard: "${item.preview}"`);
            } else if (item.type === 'image' && item.imageData) {
                const image = nativeImage.createFromBuffer(Buffer.from(item.imageData));
                clipboard.writeImage(image);
                console.log(`✅ Copied image to clipboard`);
            }

            // Hide overlay
            overlayWindow.hide();
        }
    });

    // Delete item
    ipcMain.on('delete-item', (_, itemId: number) => {
        dbService.deleteItem(itemId);

        // Notify renderer to refresh list
        overlayWindow.webContents.send('items-updated');
    });

    // Settings IPC handlers
    ipcMain.handle('get-settings', async () => {
        return {
            globalShortcut: dbService.getSetting('globalShortcut') || 'CommandOrControl+Shift+V',
            historyLimit: parseInt(dbService.getSetting('historyLimit') || '50'),
            launchAtStartup: dbService.getSetting('launchAtStartup') === 'true'
        };
    });

    ipcMain.on('update-settings', (_, settings) => {
        // Capture old shortcut before saving
        const oldShortcut = dbService.getSetting('globalShortcut') || 'CommandOrControl+Shift+V';

        // Save settings to database
        dbService.setSetting('globalShortcut', settings.globalShortcut);
        dbService.setSetting('historyLimit', settings.historyLimit.toString());
        dbService.setSetting('launchAtStartup', settings.launchAtStartup.toString());

        // Re-register global shortcut if it changed (Fix 2)
        if (settings.globalShortcut !== oldShortcut) {
            reRegisterShortcuts();
            console.log(`🔄 Shortcut changed: ${oldShortcut} → ${settings.globalShortcut}`);
        }

        // Apply launch-at-startup setting (Fix 2)
        app.setLoginItemSettings({
            openAtLogin: settings.launchAtStartup,
            name: 'Clipit'
        });

        // Notify overlay to refresh with new history limit (Fix 3)
        if (!overlayWindow.isDestroyed()) {
            overlayWindow.webContents.send('items-updated');
        }

        console.log('✅ Settings updated:', settings);
    });

    ipcMain.on('clear-history', () => {
        dbService.clearAll();
        overlayWindow.webContents.send('items-updated');
        console.log('🗑️  All clipboard history cleared');
    });
}
