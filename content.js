// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }
});

// Add a context menu item when text is selected
chrome.runtime.sendMessage({
  type: 'createContextMenu',
  title: 'Ask AI Assistant'
});
