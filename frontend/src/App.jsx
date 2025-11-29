import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    destination: '', budget: '', duration_days: '', interests: ''
  })
  const [loading, setLoading] = useState(false)
  const [tripPlan, setTripPlan] = useState(null)
  const [error, setError] = useState(null)
  
  // SLIDE STATE: 0=Form, 1=Overview, 2=Hotels, 3=Places, 4=Food, 5=Itinerary
  const [currentSlide, setCurrentSlide] = useState(0)

  // Image Helper (Pollinations.ai)
  const getImageUrl = (prompt) => {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}%20travel%20photography%204k?width=1200&height=600&nologo=true`;
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  
  // Use 127.0.0.1 for safety
  const BACKEND_URL = 'http://127.0.0.1:8000/generate-trip/'; 

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setTripPlan(null)

    try {
      const response = await axios.post(BACKEND_URL, {
        destination: formData.destination,
        budget: parseInt(formData.budget),
        duration_days: parseInt(formData.duration_days),
        interests: formData.interests
      })
      setTripPlan(response.data.plan)
      setCurrentSlide(1) // Auto-start the show
    } catch (err) {
      console.error(err)
      setError("Failed to connect. Check Backend Terminal.")
    } finally {
      setLoading(false)
    }
  }

  // --- KEYBOARD LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!tripPlan) return; // Only work if plan is generated

      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide(prev => Math.min(prev + 1, 5))
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(prev - 1, 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tripPlan])

  // --- RENDER SLIDES ---
  const renderSlide = () => {
    if (!tripPlan && currentSlide !== 0) return null;

    switch(currentSlide) {
      case 0: // FORM
        return (
          <div className="slide-content form-slide">
             <header className="hero">
                <h1>🌍 WanderWise AI</h1>
                <p>Your Ultimate Smart Travel Planner</p>
              </header>
              <div className="form-container">
                <form onSubmit={handleSubmit} className="trip-form">
                  <div className="form-group">
                    <label>Where to?</label>
                    <input type="text" name="destination" placeholder="e.g. Bali, Indonesia" value={formData.destination} onChange={handleChange} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Budget</label>
                      <input type="number" name="budget" placeholder="e.g. 50000" value={formData.budget} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Days</label>
                      <input type="number" name="duration_days" placeholder="e.g. 5" value={formData.duration_days} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Interests</label>
                    <input type="text" name="interests" placeholder="e.g. Beaches, Nightlife" value={formData.interests} onChange={handleChange} required />
                  </div>
                  <button type="submit" disabled={loading} className="generate-btn">
                    {loading ? "We are Planning your Trip..." : "Plan My Trip 🚀"}
                  </button>
                  {error && <div className="error-msg">{error}</div>}
                </form>
              </div>
          </div>
        );

      case 1: // OVERVIEW
        return (
          <div className="slide-content">
            <div className="destination-banner full-screen-banner">
              <img src={getImageUrl(`${formData.destination} iconic landscape`)} alt="Banner" />
              <div className="banner-overlay center-overlay">
                <h1>Trip to {formData.destination}</h1>
                <div className="total-badge big-badge">Total Est: {tripPlan.total_estimated_cost}</div>
              </div>
            </div>
            <div className="slide-body">
              <h3>💰 Cost Breakdown</h3>
              <div className="budget-breakdown big-grid">
                <div className="cost-item"><span>🏨 Stay</span><strong>{tripPlan.cost_breakdown.stay}</strong></div>
                <div className="cost-item"><span>🍲 Food</span><strong>{tripPlan.cost_breakdown.food}</strong></div>
                <div className="cost-item"><span>🚕 Travel</span><strong>{tripPlan.cost_breakdown.travel}</strong></div>
                <div className="cost-item"><span>🧗 Activities</span><strong>{tripPlan.cost_breakdown.activities}</strong></div>
              </div>
              <p className="hint">Press ➡️ Arrow Key to Continue</p>
            </div>
          </div>
        );

      case 2: // HOTELS (Scrollable)
        return (
          <div className="slide-content scrollable-slide">
            <h2>🏨 Where to Stay</h2>
            <div className="cards-grid">
              {tripPlan.hotels.map((item, idx) => (
                <div key={idx} className="card">
                  <div className="card-img"><img src={getImageUrl(`${item.name} hotel ${formData.destination} exterior`)} alt={item.name} /></div>
                  <div className="card-info"><h4>{item.name}</h4><p>⭐ {item.rating} • 💰 {item.price}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // PLACES (Scrollable)
        return (
          <div className="slide-content scrollable-slide">
            <h2>📸 Places to Visit</h2>
            <div className="cards-grid">
              {tripPlan.places_to_visit.map((item, idx) => (
                <div key={idx} className="card">
                  <div className="card-img"><img src={getImageUrl(`${item.name} ${formData.destination} tourist place`)} alt={item.name} /></div>
                  <div className="card-info"><h4>{item.name}</h4><p>🎫 {item.entry_fee} • 🏷️ {item.type}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // RESTAURANTS (Scrollable)
        return (
          <div className="slide-content scrollable-slide">
             <h2>🍽️ Where to Eat</h2>
             <div className="cards-grid">
              {tripPlan.restaurants.map((item, idx) => (
                <div key={idx} className="card">
                  <div className="card-img"><img src={getImageUrl(`${item.name} food dish ${formData.destination}`)} alt={item.name} /></div>
                  <div className="card-info"><h4>{item.name}</h4><p>🥘 {item.cuisine} • 💵 {item.price_range}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5: // ITINERARY (Scrollable)
        return (
          <div className="slide-content scrollable-slide">
            <h2>🗓️ Day-by-Day Itinerary</h2>
            <div className="timeline">
              {tripPlan.itinerary.map((day, idx) => (
                <div key={idx} className="day-card">
                  <div className="day-image"><img src={getImageUrl(`${day.image_prompt} ${formData.destination}`)} alt={`Day ${day.day}`} /></div>
                  <div className="day-content">
                    <div className="day-header">Day {day.day}</div>
                    <ul className="activity-list">{day.activities.map((act, i) => <li key={i}>{act}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
             <button onClick={() => setCurrentSlide(0)} className="restart-btn">Plan Another Trip ↺</button>
          </div>
        );

      default: return null;
    }
  }

  return (
    <div className="app-container">
      {/* Navigation Indicators */}
      {tripPlan && (
        <div className="nav-dots">
          {[1,2,3,4,5].map(n => (
            <span key={n} className={`dot ${currentSlide === n ? 'active' : ''}`} onClick={() => setCurrentSlide(n)}></span>
          ))}
        </div>
      )}

      {/* ACTIVE SLIDE */}
      <div className="slide-container">
        {renderSlide()}
      </div>
    </div>
  )
}

export default App