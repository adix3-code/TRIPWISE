import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# 1. SETUP
# load_dotenv() 
# 👇 PASTE YOUR ACTUAL API KEY INSIDE THESE QUOTES
KEY = "AIzaSyCRJ8NOra5bfFhxVJDEEFTcaXGG8o1Z0po" 

genai.configure(api_key=KEY)

# 2. AUTO-SELECT BEST MODEL
active_model = None
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            if 'flash' in m.name:
                active_model = genai.GenerativeModel(m.name)
                break
    if not active_model:
         active_model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    active_model = genai.GenerativeModel('gemini-pro')

def generate_travel_plan(destination: str, budget: int, duration: int, interests: str):
    print(f"🤖 Generating more than 5-option plan for {destination}...")
    
    prompt = f"""
    Act as a local travel expert. Create a trip for {destination}.
    Budget: {budget}, Duration: {duration} days, Interests: {interests}.
    
    CRITICAL INSTRUCTIONS:
    1. PROVIDE VARIETY: List more than 5 DIFFERENT options for Hotels, Places, and Restaurants, if more options are available suggest all those.
    2. REAL DATA: Ensure all hotels and places are real and currently open.
    3. BUDGET MATCH: If budget is high, show luxury. If low, show budget-friendly.
    4. FORMAT: Return ONLY JSON.
    
    OUTPUT JSON STRUCTURE:
    {{
      "total_estimated_cost": "Currency Amount",
      "cost_breakdown": {{ "stay": "Amount", "food": "Amount", "travel": "Amount", "activities": "Amount" }},
      
      "hotels": [ 
          {{ "name": "Hotel Option A", "price": "Price/night", "rating": "Rating" }},
          {{ "name": "Hotel Option B", "price": "Price/night", "rating": "Rating" }},
          {{ "name": "Hotel Option C", "price": "Price/night", "rating": "Rating" }},
          {{ "name": "Hotel Option D", "price": "Price/night", "rating": "Rating" }},
          {{ "name": "Hotel Option E", "price": "Price/night", "rating": "Rating" }}
      ],
      
      "places_to_visit": [
          {{ "name": "Place A", "type": "Type", "entry_fee": "Cost" }},
          {{ "name": "Place B", "type": "Type", "entry_fee": "Cost" }},
          {{ "name": "Place C", "type": "Type", "entry_fee": "Cost" }},
          {{ "name": "Place D", "type": "Type", "entry_fee": "Cost" }},
          {{ "name": "Place E", "type": "Type", "entry_fee": "Cost" }}
      ],
      
      "restaurants": [
          {{ "name": "Restaurant A", "cuisine": "Cuisine", "price_range": "Cost" }},
          {{ "name": "Restaurant B", "cuisine": "Cuisine", "price_range": "Cost" }},
          {{ "name": "Restaurant C", "cuisine": "Cuisine", "price_range": "Cost" }},
          {{ "name": "Restaurant D", "cuisine": "Cuisine", "price_range": "Cost" }},
          {{ "name": "Restaurant E", "cuisine": "Cuisine", "price_range": "Cost" }}
      ],
      
      "itinerary": [
         {{ 
           "day": 1, 
           "theme": "Theme of day",
           "map_location": "Main Google Maps Keyword",
           "image_prompt": "Visual description",
           "activities": ["Activity 1", "Activity 2"],
           "transport_mode": "Metro/Cab",
           "transport_tip": "Tip",
           "nearby_food_stop": "Specific Restaurant Name",
           "daily_budget_est": "Cost"
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