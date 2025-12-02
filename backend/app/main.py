from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from . import models, database, ai_generator

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TripRequest(BaseModel):
    destination: str
    budget: int
    duration_days: int
    interests: str

@app.post("/generate-trip/")
def generate_and_save_trip(trip_data: TripRequest, db: Session = Depends(get_db)):
    ai_plan = ai_generator.generate_travel_plan(
        trip_data.destination, 
        trip_data.budget, 
        trip_data.duration_days, 
        trip_data.interests
    )

    if "error" in ai_plan:
        raise HTTPException(status_code=500, detail=ai_plan["error"])

    new_trip = models.Trip(
        destination=trip_data.destination,
        budget=trip_data.budget,
        duration_days=trip_data.duration_days,
        interests=trip_data.interests,
        generated_itinerary=json.dumps(ai_plan)
    )
    
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    return {"status": "success", "trip_id": new_trip.id, "plan": ai_plan}