import { globalShortcut, BrowserWindow } from 'electron';
import { dbService } from './database';

export function registerShortcuts(overlayWindow: BrowserWindow): void {
    const shortcut = dbService.getSetting('globalShortcut') || 'CommandOrControl+Shift+V';

    const registered = globalShortcut.register(shortcut, () => {
        if (overlayWindow.isDestroyed()) {
            console.error('❌ Overlay window has been destroyed');
            return;
        }

        if (overlayWindow.isVisible()) {
            overlayWindow.hide();
        } else {
            // Center window on current display
            const { screen } = require('electron');
            const cursor = screen.getCursorScreenPoint();
            const display = screen.getDisplayNearestPoint(cursor);

            const x = Math.floor(display.bounds.x + (display.bounds.width - 500) / 2);
            const y = Math.floor(display.bounds.y + (display.bounds.height - 600) / 2);

            overlayWindow.setPosition(x, y);
            overlayWindow.show();
            overlayWindow.focus();
        }
    });

    if (registered) {
        console.log(`✅ Global shortcut registered: ${shortcut}`);
    } else {
        console.error(`❌ Failed to register shortcut: ${shortcut}`);
    }
}

export function unregisterAllShortcuts(): void {
    globalShortcut.unregisterAll();
    console.log('✅ All shortcuts unregistered');
}
