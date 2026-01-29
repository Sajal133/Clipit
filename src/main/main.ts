import { app, BrowserWindow } from 'electron';
import path from 'path';
import { dbService } from './database';
import { clipboardMonitor } from './clipboard';
import { initTray, destroyTray } from './tray';
import { registerShortcuts, unregisterAllShortcuts } from './shortcuts';
import { setupIPC } from './ipc';

let overlayWindow: BrowserWindow | null = null;
let isQuitting = false;

function createOverlayWindow(): BrowserWindow {
    const win = new BrowserWindow({
        width: 500,
        height: 600,
        show: false,  // Hidden by default
        frame: false,
        resizable: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        transparent: false,
        backgroundColor: '#2d2d2d',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js')
        }
    });

    // Load the React app
    win.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Hide on blur (click outside) - DON'T close/destroy
    win.on('blur', () => {
        if (win.isVisible() && !win.isDestroyed()) {
            win.hide();
        }
    });

    // Prevent window from being destroyed when closed (unless app is quitting)
    win.on('close', (e) => {
        if (!isQuitting) {
            e.preventDefault();
            win.hide();
        }
    });

    return win;
}

app.whenReady().then(async () => {
    console.log('=================================');
    console.log('🚀 Clipit Starting...');
    console.log('=================================');

    // Hide app from dock and menu bar - run as menu bar app only
    if (process.platform === 'darwin') {
        app.dock.hide();
    }

    // Initialize database
    await dbService.initialize();

    // Create overlay window
    overlayWindow = createOverlayWindow();

    // Setup IPC handlers
    setupIPC(overlayWindow);

    // Register global shortcuts
    registerShortcuts(overlayWindow);

    // Set overlay window for clipboard monitor (for real-time updates)
    clipboardMonitor.setOverlayWindow(overlayWindow);

    // Start clipboard monitoring BEFORE creating tray (so tray shows correct state)
    clipboardMonitor.start();

    // Create system tray (AFTER starting monitoring so it detects correct state)
    initTray(overlayWindow);

    console.log('✅ Clipit is ready!');
    console.log(`📋 Press ${dbService.getSetting('globalShortcut')} to open clipboard history`);
});

// Don't quit when all windows are closed (run in background)
app.on('window-all-closed', (e: Event) => {
    e.preventDefault();
});

app.on('activate', () => {
    if (overlayWindow) {
        overlayWindow.show();
        overlayWindow.focus();
    }
});

app.on('before-quit', () => {
    console.log('\n=================================');
    console.log('🛑 Clipit Shutting Down...');
    console.log('=================================');

    // Set quit flag to allow window destruction
    isQuitting = true;

    // Clean up resources
    clipboardMonitor.stop();
    unregisterAllShortcuts();
    destroyTray();
    dbService.close();

    // Force destroy overlay window
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.destroy();
        overlayWindow = null;
    }

    console.log('✅ Cleanup complete');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
