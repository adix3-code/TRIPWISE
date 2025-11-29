import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# 1. SETUP
# load_dotenv()  <-- Commented out to ensure hardcoded key works
# 👇 PASTE YOUR ACTUAL API KEY INSIDE THESE QUOTES
KEY = "AIzaSyAUSx-KVFtuDBfJBPz87275Z71vF7zKNeg" 

genai.configure(api_key=KEY)

# 2. AUTO-SELECT BEST MODEL
active_model = None
try:
    # Priority: Flash (Fast) -> Pro (Smart)
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            if 'flash' in m.name:
                active_model = genai.GenerativeModel(m.name)
                break
    if not active_model:
         active_model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Error finding model: {e}")
    active_model = genai.GenerativeModel('gemini-pro')

def generate_travel_plan(destination: str, budget: int, duration: int, interests: str):
    print(f"🤖 Generating slide-show plan for {destination}...")
    
    prompt = f"""
    Act as a travel planner. Create a trip for {destination}.
    Budget: {budget}, Duration: {duration} days, Interests: {interests}.
    
    CRITICAL OUTPUT FORMAT:
    Return ONLY JSON. No text. Use this exact structure:
    {{
      "total_estimated_cost": "Currency Amount",
      "cost_breakdown": {{ "stay": "Amount", "food": "Amount", "travel": "Amount", "activities": "Amount" }},
      
      "hotels": [ 
          {{ "name": "Hotel Name", "price": "Price/night", "rating": "4.5 stars" }} 
      ],
      
      "places_to_visit": [
          {{ "name": "Place Name", "type": "Adventure/Relax", "entry_fee": "Cost" }} 
      ],
      
      "restaurants": [
          {{ "name": "Restaurant Name", "cuisine": "Italian", "price_range": "Cost" }} 
      ],
      
      "itinerary": [
         {{ 
           "day": 1, 
           "image_prompt": "A short 5-word description of the main visual highlight of this day (e.g. Eiffel tower at sunset)",
           "activities": ["Activity 1", "Activity 2", "Activity 3"] 
         }} 
      ]
    }}
    """

    try:
        response = active_model.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": str(e)}