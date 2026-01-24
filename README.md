# 📋 Clipit - Never Lose What You Copy Again

> **Smart clipboard manager for macOS and Windows** - Automatically save your clipboard history and access it with a single keyboard shortcut.

## ✨ Features

- **📋 Automatic Clipboard History** - Saves everything you copy (text & images)
- **⚡ Lightning Fast Access** - Press `⌘ + Shift + V` (Mac) or `Ctrl + Shift + V` (Windows)
- **🔍 Smart Search** - Quickly find items with built-in search bar
- **🖼️ Image Support** - Preview and paste copied images with thumbnails
- **🔢 Quick Selection** - Press 1-9 to instantly select visible items
- **💾 Persistent Storage** - Your history survives restarts
- **⏸️ Pause/Resume** - Control monitoring from system tray
- **📜 Unlimited Scrolling** - Access your entire clipboard history
- **🎯 Clean Interface** - Minimal design, maximum productivity
- **🔒 Privacy First** - Everything stays on your computer, no cloud sync

## 🚀 Quick Start

1. **Copy** anything as usual (`⌘/Ctrl + C`)
2. **Open clipboard history** by pressing:
   - macOS: `⌘ + Shift + V`
   - Windows: `Ctrl + Shift + V`
3. **Search** (optional) - Type to filter items
4. **Select an item**:
   - Press `1-9` for quick selection
   - Click with mouse
   - Use arrow keys + Enter
5. **Paste** the selected item (`⌘/Ctrl + V`)

## 📥 Installation

### macOS
1. Download the app
2. Drag Clipit to Applications folder
3. Launch Clipit
4. Grant Accessibility permission when prompted (needed for global shortcuts)
   - System Settings → Privacy & Security → Accessibility → Add Clipit

### Windows
1. Download the installer or portable version
2. Run the executable
3. If SmartScreen appears, click "More info" → "Run anyway"
4. The app will appear in your system tray

## ⌨️ Keyboard Shortcuts

| Action | macOS | Windows |
|--------|-------|---------|
| Open History | `⌘ + Shift + V` | `Ctrl + Shift + V` |
| Select Item 1-9 | `1-9` | `1-9` |
| Delete Item | `Delete` / `Backspace` | `Delete` / `Backspace` |
| Close Window | `Esc` | `Esc` |

**Note:** When search bar is focused, keyboard shortcuts don't interfere with typing.

## ⚙️ Settings

Access settings through the system tray icon:
- Right-click the **Cb** icon → **Settings...**

### Available Options

- **Global Shortcut** - Customize your keyboard shortcut
- **History Limit** - Set max items to save (10-250)
- **Launch at Startup** - Start automatically when you log in
- **Clear History** - Delete all saved clipboard items

### Tray Menu Options

- **✓ Monitoring Active (Click to Pause)** - Pause clipboard monitoring
- **⏸ Monitoring Paused (Click to Resume)** - Resume clipboard monitoring
- **Settings...** - Open settings window
- **Quit Clipit** - Exit the application (tray icon will be removed)

## 🎨 How to Use

### Basic Workflow
```
Copy → Copy → Copy → Shortcut (⌘/Ctrl+Shift+V) → Search/Select → Paste
```

### Searching
- Open clipboard history
- Start typing in the search bar
- Items filter in real-time
- Press a number key or click to select
- Clear search with the × button

### Managing Items
- **Hover over an item** to see the delete button
- **Click the delete button** or press Delete/Backspace
- **Number badges** (1-9) show which key to press for quick selection

## 📂 File Locations

### macOS
- **App Data**: `~/Library/Application Support/clipit/`
- **Database**: `~/Library/Application Support/clipit/clipboard.db`

### Windows
- **App Data**: `%APPDATA%\clipit\`
- **Database**: `%APPDATA%\clipit\clipboard.db`

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/clipit.git
cd clipit

# Install dependencies
npm install

# Run in development
npm start

# Build for production
npm run build

# Package for distribution
npm run pack:mac   # macOS
npm run pack:win   # Windows
```

### Project Structure

```
clipit/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts       # App entry point
│   │   ├── clipboard.ts  # Clipboard monitoring
│   │   ├── database.ts   # SQLite database
│   │   ├── tray.ts       # System tray icon
│   │   ├── shortcuts.ts  # Global shortcuts
│   │   └── ipc.ts        # Inter-process communication
│   ├── renderer/          # React UI
│   │   ├── App.tsx       # Main clipboard history window
│   │   ├── SettingsComponent.tsx  # Settings window
│   │   ├── styles.css    # Main window styles
│   │   └── settings-styles.css    # Settings styles
│   └── shared/           # Shared types
├── assets/               # Icons and images
└── dist/                 # Compiled output
```

### Key Technologies
- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **TypeScript** - Type safety
- **sql.js** - SQLite database
- **Webpack** - Bundler

## 🐛 Troubleshooting

### macOS

#### Global shortcut not working
**Solution:** Grant Accessibility permission
1. System Settings → Privacy & Security → Privacy
2. Select Accessibility
3. Add Clipit and enable the checkbox

#### "App from unidentified developer"
**Solution:**
1. Right-click the app → Select "Open"
2. Click "Open" in the dialog
3. Only needed first time

### Windows

#### "Windows protected your PC"
**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. This is normal for unsigned apps

#### App won't start
**Solution:**
- Install Microsoft Visual C++ Redistributable
- Download from Microsoft's website
- Restart and try again

### General Issues

#### History not saving
- Check disk space
- Verify write permissions to app data directory
- Try restarting the app

#### Images not displaying
- Large images over 10MB are skipped
- Check if image format is supported (PNG, JPEG)

#### Search bar not responding
- If backspace/delete doesn't work, this is now fixed in latest version
- Restart the app to get the update

## 🔒 Privacy & Security

- ✅ **Local Storage Only** - Nothing sent to the cloud
- ✅ **No Internet Required** - Works completely offline
- ✅ **No Tracking** - We don't collect any data
- ✅ **No Analytics** - Your privacy is protected
- ✅ **Open Database** - SQLite format, you can inspect it

You can delete the app data folder anytime to remove all saved clipboard history.

## 📝 What's New in v1.0

### Latest Updates
- ✅ **Search functionality** - Filter clipboard items in real-time
- ✅ **Unlimited scrolling** - View all items, not just first 9
- ✅ **Fixed pause/resume** - Tray menu now shows correct monitoring state
- ✅ **Proper tray cleanup** - No more duplicate tray icons
- ✅ **Number sync** - Displayed numbers match keyboard shortcuts when filtering

### Recent Fixes
- Fixed search bar editing (backspace/delete now work)
- Fixed keyboard shortcuts interfering with search input
- Fixed item number mismatch after filtering
- Proper initialization order (monitoring starts before tray creation)
- Tray icon properly destroyed on quit

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://reactjs.org/) - UI library  
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [sql.js](https://sql.js.org/) - Database  

## 📮 Support

- **Issues**: [GitHub Issues](#)
- **Email**: support@clipit.app

---

**Made with ❤️ for productivity enthusiasts**

*Version 1.0.0 | January 2026*
