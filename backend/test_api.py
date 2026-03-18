
import requests

try:
    print("Requesting plans...")
    response = requests.get('https://softwarebycg.shop/users/api/subscriptions/plans/')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
