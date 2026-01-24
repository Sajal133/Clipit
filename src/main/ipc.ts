import { ipcMain, BrowserWindow, clipboard, nativeImage } from 'electron';
import { dbService } from './database';

export function setupIPC(overlayWindow: BrowserWindow): void {
    // Get recent clipboard items
    ipcMain.handle('get-items', async () => {
        const items = dbService.getRecentItems();
        return items;
    });

    // Select item - copy to clipboard and close window
    ipcMain.on('select-item', (_, itemId: number) => {
        // Special case: -1 means just hide window (from Escape key)
        if (itemId === -1) {
            overlayWindow.hide();
            return;
        }

        const items = dbService.getRecentItems();
        const item = items.find(i => i.id === itemId);

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
        // Save settings to database
        dbService.setSetting('globalShortcut', settings.globalShortcut);
        dbService.setSetting('historyLimit', settings.historyLimit.toString());
        dbService.setSetting('launchAtStartup', settings.launchAtStartup.toString());

        console.log('✅ Settings updated:', settings);
    });

    ipcMain.on('clear-history', () => {
        dbService.clearAll();
        overlayWindow.webContents.send('items-updated');
        console.log('🗑️  All clipboard history cleared');
    });
}
