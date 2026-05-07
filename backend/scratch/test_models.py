import google.generativeai as genai
api_key = "AIzaSyC8TmqL5HjjE7OE64wlsMUffvYM_ffknkw"
genai.configure(api_key=api_key)

models_to_test = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-pro',
    'gemini-1.0-pro'
]

for model_name in models_to_test:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hola, dime 'ok' si funcionas.")
        print(f"Model {model_name}: SUCCESS - {response.text.strip()}")
    except Exception as e:
        print(f"Model {model_name}: FAILED - {str(e)[:100]}...")
