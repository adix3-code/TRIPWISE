import os
from dotenv import load_dotenv
import google.generativeai as genai
load_dotenv()
KEY = os.getenv("GEMINI_API_KEY")

if not KEY:
    print("🔴 ERROR: GEMINI_API_KEY not found in .env file.")
    print("Please check your .env file or hardcode the key for this test.")
    exit()

try:
    genai.configure(api_key=KEY)
    print("🟢 Attempting to list models...")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ Found working model: {model.name}")

    print("\nTest Complete.")

except Exception as e:
    print(f"\n❌ CRITICAL API KEY FAILURE ❌")
    print(f"Error Code/Message: {e}")
    print("This confirms the API key is either invalid, revoked, or has billing issues.")