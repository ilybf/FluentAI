async function testKeys() {
  const key = 'sk-nNGwcml0J3qbsSc8UfryOa2eyKTIuK5giLdj1qgATo2iChJK';
  
  // Test OpenAI
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    console.log('OpenAI:', await openaiRes.text().catch(()=>''));
  } catch (e) { console.error('OpenAI Error'); }

  // Test OpenRouter Models
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{role: 'user', content: 'hi'}]
      })
    });
    console.log('OpenRouter:', await orRes.text().catch(()=>''));
  } catch (e) { console.error('OpenRouter Error'); }
}

testKeys();
