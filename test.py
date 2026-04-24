import urllib.request
import json

url = "https://api.agentrouter.org/v1/models"
req = urllib.request.Request(url, headers={
    'Authorization': 'Bearer sk-nNGwcml0J3qbsSc8UfryOa2eyKTIuK5giLdj1qgATo2iChJK'
})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode()[:500])
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
