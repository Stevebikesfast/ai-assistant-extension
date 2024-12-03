# AI Assistant Chrome Extension

A Chrome extension that integrates OpenAI's GPT-4 for intelligent assistance while browsing.

## Features

- 🤖 OpenAI GPT-4 Integration
- 💬 Chat Interface
- 📝 Context Menu Integration
- 🔒 Secure API Key Handling

## Getting Started

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-assistant-extension.git
cd ai-assistant-extension
```

2. Install dependencies:
```bash
npm install
```

3. Configure the extension:
   - Open `background.js`
   - Replace `your-api-key` with your OpenAI API key

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension directory
4. The extension icon should appear in your Chrome toolbar

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
