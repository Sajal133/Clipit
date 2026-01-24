import { clipboard, nativeImage, BrowserWindow } from 'electron';
import crypto from 'crypto';
import { dbService } from './database';

class ClipboardMonitor {
    private interval: ReturnType<typeof setInterval> | null = null;
    private lastText: string = '';
    private lastImageHash: string = '';
    private isMonitoring: boolean = false;
    private overlayWindow: BrowserWindow | null = null;

    setOverlayWindow(window: BrowserWindow): void {
        this.overlayWindow = window;
    }

    start(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        console.log('✓ Started clipboard monitoring');

        // Poll every 500ms
        this.interval = setInterval(() => {
            this.checkClipboard();
        }, 500);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isMonitoring = false;
        console.log('✗ Stopped clipboard monitoring');
    }

    private checkClipboard(): void {
        // Skip if monitoring is paused
        if (!this.isMonitoring) {
            return;
        }

        try {
            // Check for text first
            const text = clipboard.readText();
            if (text && text !== this.lastText && text.trim().length > 0) {
                this.handleNewText(text);
                this.lastText = text;
                return;
            }

            // Check for image
            const image = clipboard.readImage();
            if (!image.isEmpty()) {
                const imageBuffer = image.toPNG();
                const imageHash = this.hashImage(imageBuffer);
                if (imageHash !== this.lastImageHash) {
                    this.handleNewImage(imageBuffer, imageHash);
                    this.lastImageHash = imageHash;
                }
            }
        } catch (error) {
            console.error('Clipboard check failed:', error);
        }
    }

    private handleNewText(text: string): void {
        // Limit text size to 1MB
        if (text.length > 1_000_000) {
            console.warn('⚠ Text too large, truncating to 1MB');
            text = text.substring(0, 1_000_000);
        }

        const preview = text.length > 100
            ? text.substring(0, 100) + '...'
            : text;

        dbService.addItem({
            type: 'text',
            content: text,
            timestamp: Date.now(),
            preview
        });
        console.log(`📝 Saved text: "${preview}"`);
        this.lastText = text;

        // Notify overlay to refresh
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.webContents.send('items-updated');
        }
    }

    private handleNewImage(imageBuffer: Buffer, imageHash: string): void {
        // Limit image size to 10MB
        if (imageBuffer.length > 10_000_000) {
            console.warn('⚠ Image too large (>10MB), skipping');
            return;
        }

        const sizeKB = Math.round(imageBuffer.length / 1024);
        // const preview = `Image (${sizeKB} KB)`; // Preview is now set directly in addItem

        dbService.addItem({
            type: 'image',
            imageData: imageBuffer,
            timestamp: Date.now(),
            preview: `Image (${Math.round(imageBuffer.length / 1024)} KB)`
        });
        console.log(`🖼️  Saved image: ${Math.round(imageBuffer.length / 1024)} KB`);
        this.lastImageHash = imageHash;

        // Notify overlay to refresh
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.webContents.send('items-updated');
        }
    }

    private hashImage(buffer: Buffer): string {
        // Simple hash: first 16 bytes + length
        const sample = buffer.slice(0, 16).toString('hex');
        return `${sample}-${buffer.length}`;
    }

    getStatus(): boolean {
        return this.isMonitoring;
    }

    isRunning(): boolean {
        return this.isMonitoring;
    }
}

export const clipboardMonitor = new ClipboardMonitor();
