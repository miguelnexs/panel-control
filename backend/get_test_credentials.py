import mercadopago
import requests

# Tu Access Token actual (el que sale en la foto)
ACCESS_TOKEN = "APP_USR-8211632158852443-122717-3b11cdbafb0101b26658ae6564bac731-2531316852"

def create_test_user():
    url = "https://api.mercadopago.com/users/test_user"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "site_id": "MCO" # Colombia
    }
    
    print("Solicitando credenciales TEST reales a Mercado Pago...")
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 201:
        user_data = response.json()
        print("\n¡Éxito! Credenciales TEST generadas:")
        print(f"Nickname: {user_data.get('nickname')}")
        print(f"Password: {user_data.get('password')}")
        print("-" * 50)
        print("COPIA ESTAS CREDENCIALES EN TU .ENV:")
        print(f"MERCADOPAGO_PUBLIC_KEY={user_data.get('site_status')}") # A veces viene aqui, pero mejor revisamos keys
        
        # Las keys suelen venir en la respuesta o hay que pedirlas para este usuario?
        # En test_user response, no siempre vienen las keys completas, pero intentemos.
        # Si no, usamos este usuario para generar pagos.
        
        # Nota: El endpoint test_user devuelve un usuario COMPRADOR/VENDEDOR de prueba.
        # Pero no devuelve sus Access Tokens directamente en la estructura simple a veces.
        # Vamos a imprimir todo para ver qué nos da.
        print(user_data)
    else:
        print(f"Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    create_test_user()