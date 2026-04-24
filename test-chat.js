async function testChat() {
  const key = 'sk-nNGwcml0J3qbsSc8UfryOa2eyKTIuK5giLdj1qgATo2iChJK';
  
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Test App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4-6',
        messages: [{role: 'user', content: 'test'}]
      })
    });
    console.log('Status:', res.status);
    console.log('OpenRouter:', await res.text());
  } catch (e) { console.error('OpenRouter Error:', e); }
}

testChat();
