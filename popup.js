document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');

  function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function handleSendMessage() {
    const content = userInput.value.trim();
    if (!content) return;

    // Add user message to chat
    addMessage(content, true);
    userInput.value = '';

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: 'sendMessage',
        content
      });

      // Add assistant response to chat
      if (response && response.content) {
        addMessage(response.content, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Error: Could not get response', false);
    }
  }

  sendButton.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
});
