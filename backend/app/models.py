from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, index=True)
    budget = Column(Integer)
    duration_days = Column(Integer)
    interests = Column(String)
    generated_itinerary = Column(Text) # Stores the big JSON blob