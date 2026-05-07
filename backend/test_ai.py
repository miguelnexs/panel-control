import google.generativeai as genai
api_key = "AIzaSyC8TmqL5HjjE7OE64wlsMUffvYM_ffknkw"
genai.configure(api_key=api_key)
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"{m.name}")
