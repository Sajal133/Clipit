import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Clipboard overlay methods
    getItems: () => ipcRenderer.invoke('get-items'),
    selectItem: (id: number) => ipcRenderer.send('select-item', id),
    deleteItem: (id: number) => ipcRenderer.send('delete-item', id),
    onItemsUpdated: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('items-updated', handler);
        return () => {
            ipcRenderer.removeListener('items-updated', handler);
        };
    },

    // Settings methods
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings: { globalShortcut: string; historyLimit: number; launchAtStartup: boolean; }) =>
        ipcRenderer.send('update-settings', settings),
    clearHistory: () => ipcRenderer.send('clear-history')
});
