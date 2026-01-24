import { Menu, Tray, BrowserWindow, app, nativeImage } from 'electron';
import path from 'path';
import { clipboardMonitor } from './clipboard';

let tray: Tray | null = null;

export function destroyTray(): void {
    if (tray) {
        tray.destroy();
        tray = null;
        console.log('✅ System tray icon destroyed');
    }
}

export function initTray(overlayWindow: BrowserWindow): void {
    // Destroy existing tray to prevent duplicates
    if (tray) {
        tray.destroy();
        tray = null;
    }

    // "Cb" text logo inside a wide rectangle box for Clipit (22x16)
    const iconWidth = 22;
    const iconHeight = 16;
    const canvas = Buffer.alloc(iconWidth * iconHeight * 4);

    const setPixel = (x: number, y: number) => {
        if (x >= 0 && x < iconWidth && y >= 0 && y < iconHeight) {
            const i = (y * iconWidth + x) * 4;
            canvas[i] = 255;
            canvas[i + 1] = 255;
            canvas[i + 2] = 255;
            canvas[i + 3] = 255;
        }
    };

    // Draw wide rectangular container (22 wide x 16 tall)
    // Top border
    for (let x = 3; x <= 18; x++) setPixel(x, 2);
    // Bottom border
    for (let x = 3; x <= 18; x++) setPixel(x, 13);
    // Left border
    for (let y = 2; y <= 13; y++) setPixel(3, y);
    // Right border
    for (let y = 2; y <= 13; y++) setPixel(18, y);

    // Draw "C" (left side, inside box)
    // Top arc
    for (let x = 6; x <= 8; x++) setPixel(x, 5);
    // Left vertical line
    for (let y = 6; y <= 10; y++) setPixel(5, y);
    // Bottom arc
    for (let x = 6; x <= 8; x++) setPixel(x, 11);

    // Draw "b" (right side, inside box) - properly rounded
    // Vertical stem
    for (let y = 4; y <= 11; y++) setPixel(12, y);
    // Bowl - top curve
    setPixel(13, 7);
    setPixel(14, 7);
    setPixel(15, 8);
    // Bowl - right side
    setPixel(15, 9);
    // Bowl - bottom curve
    setPixel(15, 10);
    setPixel(14, 11);
    setPixel(13, 11);

    const icon = nativeImage.createFromBuffer(canvas, { width: iconWidth, height: iconHeight });
    icon.setTemplateImage(true);

    tray = new Tray(icon);
    tray.setToolTip('Clipit - Clipboard Manager');

    // Check if monitoring is currently active
    const isMonitoring = clipboardMonitor.isRunning();
    console.log(`[Tray Menu Build] Detected monitoring state: ${isMonitoring ? 'ACTIVE' : 'PAUSED'}`);


    // Build custom menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Clipboard History',
            click: () => {
                overlayWindow.show();
                overlayWindow.focus();
            }
        },
        { type: 'separator' },
        {
            label: 'Settings...',
            click: () => {
                const { createSettingsWindow } = require('./settings-window');
                createSettingsWindow();
            }
        },
        { type: 'separator' },
        {
            label: isMonitoring ? '✓ Monitoring Active (Click to Pause)' : '⏸ Monitoring Paused (Click to Resume)',
            click: () => {
                // Check current state, not the captured 'isMonitoring' value
                const currentState = clipboardMonitor.isRunning();
                console.log(`[Tray Menu] Current monitoring state: ${currentState ? 'ACTIVE' : 'PAUSED'}`);

                if (currentState) {
                    console.log('[Tray Menu] User clicked PAUSE - stopping monitoring...');
                    clipboardMonitor.stop();
                } else {
                    console.log('[Tray Menu] User clicked RESUME - starting monitoring...');
                    clipboardMonitor.start();
                }
                // Rebuild menu to update label
                initTray(overlayWindow);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit Clipit',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);

    console.log('✅ System tray icon created with custom menu');
}
