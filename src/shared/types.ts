export interface ClipboardItem {
    id: number;
    type: 'text' | 'image';
    content?: string;
    imageData?: Buffer;
    contentHash?: string;
    timestamp: number;
    preview: string;
}

export interface Settings {
    globalShortcut: string;
    historyLimit: number;
    launchAtStartup: boolean;
}
