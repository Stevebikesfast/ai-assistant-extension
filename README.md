# AI Assistant Chrome Extension

A Chrome extension that integrates OpenAI's GPT-4 for intelligent assistance while browsing.

## Features

- 🤖 OpenAI GPT-4 Integration
- 💬 Chat Interface
- 📝 Context Menu Integration
- 🔒 Secure API Key Handling

## Installation

1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Configuration

1. Open `background.js` and replace `your-api-key` with your OpenAI API key
2. The extension uses the GPT-4 model by default

## Project Structure

```
├── manifest.json        # Extension manifest
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic
├── background.js       # Background service worker
└── content.js          # Content script for page interaction
```

## Development

The extension consists of:

- Popup UI for chat interface
- Background script for API communication
- Content script for page interaction

## Security Note

The OpenAI API key should be stored securely. In a production environment, consider:
- Using a backend service to proxy requests
- Implementing proper key management
- Adding user authentication

## Usage

1. Click the extension icon to open the chat interface
2. Type your message and press Enter or click Send
3. Select text on any webpage and use the context menu for quick access
