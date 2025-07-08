# LinkVault Browser Extension

A browser extension for Chrome, Firefox, and Edge that integrates with the LinkVault app to save and organize links across all your devices.

## Features

- Save links with a single click or keyboard shortcut (`Ctrl+Shift+S` or `⌘+Shift+S` on Mac)
- Organize links with categories
- View recently saved links
- Automatic sync with the LinkVault mobile app
- Cross-browser compatibility

## Installation

### Chrome

1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `extension` directory
5. The LinkVault extension is now installed and ready to use

### Firefox

1. Download the extension files
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..." and select the `manifest.json` file in the extension directory
4. The LinkVault extension is now installed and ready to use

### Edge

1. Download the extension files
2. Open Edge and navigate to `edge://extensions/`
3. Enable "Developer mode" in the bottom left corner
4. Click "Load unpacked" and select the `extension` directory
5. The LinkVault extension is now installed and ready to use

## Usage

### Saving a Link

1. Navigate to any webpage you want to save
2. Click the LinkVault icon in your browser toolbar or use the keyboard shortcut (`Ctrl+Shift+S` or `⌘+Shift+S` on Mac)
3. The link will be saved to your LinkVault account and synced with the mobile app

### Managing Categories

1. Click the LinkVault icon in your browser toolbar
2. In the popup, you can assign categories to the current link by clicking on category pills
3. You can also manage your categories in the LinkVault web app

### Viewing Recent Links

1. Click the LinkVault icon in your browser toolbar
2. Scroll down to see your most recently saved links
3. Click on any link to open it in a new tab

## Development

### Project Structure

- `manifest.json`: Extension configuration file
- `popup/`: Contains files for the extension popup
- `background/`: Contains the background service worker
- `icons/`: Extension icons
- `welcome/`: Welcome page shown after installation

### Building for Production

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. The built extension will be in the `dist` directory

## License

Copyright © 2023 LinkVault. All rights reserved.