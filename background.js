const OPENAI_API_KEY = 'your-api-key'; // This should be stored securely
const OPENAI_ASSISTANT_ID = 'asst_ZfHROr8g5jAEZA3HgtpBd4VT';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'sendMessage') {
    handleMessage(request.content)
      .then(response => sendResponse(response))
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ error: 'Failed to get response' });
      });
    return true; // Required for async response
  }
});

async function handleMessage(content) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.'
          },
          {
            role: 'user',
            content: content
          }
        ]
      })
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}
