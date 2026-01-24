import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { ClipboardItem } from '../shared/types';

class DatabaseService {
    private db: SqlJsDatabase | null = null;
    private dbPath: string;
    private isReady: boolean = false;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.dbPath = path.join(userDataPath, 'clipboard.db');

        console.log('Database path:', this.dbPath);
    }

    async initialize() {
        const SQL = await initSqlJs();

        // Load existing database or create new one
        if (fs.existsSync(this.dbPath)) {
            const buffer = fs.readFileSync(this.dbPath);
            this.db = new SQL.Database(buffer);
            console.log('Loaded existing database');
        } else {
            this.db = new SQL.Database();
            console.log('Created new database');
        }

        // Create tables
        this.db.run(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        content TEXT,
        image_data BLOB,
        timestamp INTEGER NOT NULL,
        preview TEXT
      )
    `);

        this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

        // Set default settings
        this.setDefaultSettings();
        this.save();
        this.isReady = true;
        console.log('Database initialized');
    }

    private setDefaultSettings() {
        const defaults = {
            globalShortcut: 'CommandOrControl+Shift+V',
            historyLimit: '50',
            launchAtStartup: 'true'
        };

        for (const [key, value] of Object.entries(defaults)) {
            const existing = this.getSetting(key);
            if (!existing) {
                this.setSetting(key, value);
            }
        }
    }

    private save() {
        if (!this.db) return;
        const data = this.db.export();
        fs.writeFileSync(this.dbPath, data);
    }

    // Items
    addItem(item: Omit<ClipboardItem, 'id'>): number {
        if (!this.db) return -1;

        // Check for duplicates and delete old ones
        if (item.type === 'text' && item.content) {
            const existing = this.db.exec(
                'SELECT id FROM clipboard_items WHERE type = ? AND content = ?',
                ['text', item.content]
            );

            if (existing.length > 0 && existing[0].values.length > 0) {
                existing[0].values.forEach(row => {
                    const id = row[0] as number;
                    this.db!.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
                    console.log(`🗑️  Removed duplicate text (ID: ${id})`);
                });
            }
        } else if (item.type === 'image' && item.imageData) {
            const preview = `Image (${Math.round(item.imageData.length / 1024)} KB)`;
            const existing = this.db.exec(
                'SELECT id FROM clipboard_items WHERE type = ? AND preview = ?',
                ['image', preview]
            );

            if (existing.length > 0 && existing[0].values.length > 0) {
                existing[0].values.forEach(row => {
                    const id = row[0] as number;
                    this.db!.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
                    console.log(`🗑️  Removed duplicate image (ID: ${id})`);
                });
            }
        }

        this.db.run(
            `INSERT INTO clipboard_items (type, content, image_data, timestamp, preview)
       VALUES (?, ?, ?, ?, ?)`,
            [
                item.type,
                item.content || null,
                item.imageData || null,
                item.timestamp,
                item.preview
            ]
        );

        this.enforceHistoryLimit();
        this.save();

        const result = this.db.exec('SELECT last_insert_rowid() as id');
        return result[0].values[0][0] as number;
    }

    getRecentItems(limit: number = 50): ClipboardItem[] {
        if (!this.db) return [];

        const result = this.db.exec(
            `SELECT * FROM clipboard_items ORDER BY timestamp DESC LIMIT ?`,
            [limit]
        );

        if (result.length === 0) return [];

        const columns = result[0].columns;
        const rows = result[0].values;

        return rows.map(row => {
            const item: any = {};
            columns.forEach((col, idx) => {
                if (col === 'image_data' && row[idx]) {
                    item.imageData = row[idx] as Buffer;
                } else {
                    item[col] = row[idx];
                }
            });
            return item as ClipboardItem;
        });
    }

    deleteItem(id: number): void {
        if (!this.db) return;
        this.db.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
        this.save();
        console.log('Deleted item:', id);
    }

    clearAll(): void {
        if (!this.db) return;
        this.db.run('DELETE FROM clipboard_items');
        this.save();
        console.log('Cleared all clipboard history');
    }

    private enforceHistoryLimit(): void {
        const limit = parseInt(this.getSetting('historyLimit') || '50');

        if (!this.db) return;
        this.db.run(`
      DELETE FROM clipboard_items 
      WHERE id NOT IN (
        SELECT id FROM clipboard_items 
        ORDER BY timestamp DESC 
        LIMIT ?
      )
    `, [limit]);
    }

    // Settings
    getSetting(key: string): string | null {
        if (!this.db) return null;

        const result = this.db.exec(
            'SELECT value FROM settings WHERE key = ?',
            [key]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return null;
        }

        return result[0].values[0][0] as string;
    }

    setSetting(key: string, value: string): void {
        if (!this.db) return;

        this.db.run(
            `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
            [key, value]
        );
        this.save();
    }

    close(): void {
        if (this.db) {
            this.save();
            this.db.close();
        }
        console.log('Database closed');
    }
}

export const dbService = new DatabaseService();
