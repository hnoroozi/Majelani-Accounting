import requests
import json

# Test backend directly
try:
    # Test root endpoint
    response = requests.get("http://127.0.0.1:8000/")
    print("Root endpoint:", response.json())
    
    # Test summary endpoint
    data = {"text": "What is accounting?"}
    response = requests.post(
        "http://127.0.0.1:8000/ai/summary",
        headers={"Content-Type": "application/json"},
        json=data
    )
    print("Summary endpoint status:", response.status_code)
    if response.status_code == 200:
        print("Summary response:", response.json())
    else:
        print("Error:", response.text)
        
except Exception as e:
    print("Error:", e)