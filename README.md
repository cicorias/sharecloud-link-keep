# LinkVault

A cross-platform solution for saving and organizing links across mobile and desktop devices.

## Features

### Mobile App (iOS)
- Integrate with iOS share sheet for quick link saving
- Organize links with customizable categories and tags
- Search and filter your link collection
- Share saved links to other apps

### Desktop Browser Extension
- Save links directly from your desktop browser
- One-click saving with the toolbar button
- Keyboard shortcuts for power users (`Ctrl+Shift+S` or `⌘+Shift+S` on Mac)
- Automatic sync with the mobile app

## Architecture

LinkVault consists of two main components:

1. **Mobile Web App**: A React-based web application optimized for mobile use that integrates with the iOS share sheet
2. **Browser Extension**: Available for Chrome, Firefox, and Edge to enable desktop integration

## Project Structure

- `/src`: Main React web application
  - `/api`: API endpoints for browser extension syncing
  - `/components`: Reusable UI components
  - `/lib`: Utility functions

- `/extension`: Browser extension files
  - `/popup`: Extension popup UI
  - `/background`: Background service worker
  - `/icons`: Extension icons
  - `/welcome`: Welcome page shown after installation

## Development

### Running the Web App

```bash
npm install
npm run dev
```

### Building the Browser Extension

See the [extension README](/extension/README.md) for detailed instructions.

## License

Copyright © 2023 LinkVault. All rights reserved.