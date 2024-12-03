# AI Assistant Chrome Extension

A Chrome extension that integrates OpenAI's GPT-4 for intelligent assistance while browsing.

## Quick Start

The easiest way to get this repository on your local machine is using the GitHub CLI:

```bash
# Install GitHub CLI if you haven't already
# On macOS:
brew install gh

# On Windows:
winget install GitHub.cli

# On Ubuntu/Debian:
sudo apt install gh

# Then authenticate (you'll only need to do this once):
gh auth login

# Clone this repository:
gh repo clone yourusername/ai-assistant-extension
cd ai-assistant-extension
npm install
```

## Features

- 🤖 OpenAI GPT-4 Integration
- 💬 Chat Interface
- 📝 Context Menu Integration
- 🔒 Secure API Key Handling
- 🚀 Automated Builds via GitHub Actions

## Automated Builds

This repository includes GitHub Actions that automatically:
- Build and package the extension
- Create a new release with each push to main
- Provide downloadable ZIP files of the extension

You can find the latest version in the Releases section of the repository.

## Loading the Extension in Chrome

1. Download the latest release from the Releases page
   OR use the source code directly after cloning
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Configure your OpenAI API key in `background.js`

## Project Structure

```
├── manifest.json        # Extension manifest
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic
├── background.js       # Background service worker
└── content.js          # Content script for page interaction
```

## Development

To make changes:
1. Modify the code as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Security Note

The OpenAI API key should be stored securely. In a production environment, consider:
- Using a backend service to proxy requests
- Implementing proper key management
- Adding user authentication
