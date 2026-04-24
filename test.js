fetch('https://agentrouter.org/v1/models', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk-nNGwcml0J3qbsSc8UfryOa2eyKTIuK5giLdj1qgATo2iChJK',
    'User-Agent': 'vscode-client',
    'Accept': 'application/json',
    'Origin': 'vscode-file://vscode-app'
  }
}).then(r=>r.json()).then(r => console.log('AgentRouter VSCode:', r));

fetch('https://agentrouter.org/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-nNGwcml0J3qbsSc8UfryOa2eyKTIuK5giLdj1qgATo2iChJK',
    'Content-Type': 'application/json',
    'User-Agent': 'vscode-client'
  },
  body: JSON.stringify({
    model: 'claude-opus-4-6',
    messages: [{role: 'user', content: 'test'}]
  })
}).then(r=>r.json()).then(r => console.log('AgentRouter Chat:', r));
