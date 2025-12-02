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
  
  const [currentSlide, setCurrentSlide] = useState(0)

  const getImageUrl = (query) => {
    const cleanQuery = encodeURIComponent(query.trim());
    return `https://tse2.mm.bing.net/th?q=${cleanQuery}&w=800&h=500&c=7&rs=1&p=0`;
  }
  const getBannerUrl = (query) => {
    const cleanQuery = encodeURIComponent(query.trim());
  
    return `https://tse2.mm.bing.net/th?q=${cleanQuery}&w=1920&h=1080&c=7&rs=1&p=0`;
  }

  const openMap = (name) => {
    const query = encodeURIComponent(`${name} in ${formData.destination}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
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
      setCurrentSlide(1) 
    } catch (err) {
      console.error(err)
      setError("Failed to connect. Check Backend Terminal.")
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (!tripPlan) return;
    const totalSlides = 5 + tripPlan.itinerary.length - 1;
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides));
  }

  const prevSlide = () => {
    if (!tripPlan) return;
    setCurrentSlide(prev => Math.max(prev - 1, 1));
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!tripPlan) return;
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tripPlan])

  const renderSlide = () => {
    if (!tripPlan && currentSlide !== 0) return null;

    if (currentSlide >= 5) {
      const dayIndex = currentSlide - 5;
      const dayData = tripPlan.itinerary[dayIndex];
      return (
        <div className="slide-content day-slide-layout">
           <div className="day-left-panel">
              <div className="day-map">
                <iframe 
                  width="100%" height="100%" frameBorder="0" style={{border:0}} 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(dayData.map_location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}>
                </iframe>
              </div>
              <div className="day-budget-card">
                 <h3>💰 Daily Budget: {dayData.daily_budget_est}</h3>
                 <p>Includes Food, Travel & Entry Fees</p>
              </div>
           </div>
           <div className="day-right-panel scrollable-panel">
              <div className="day-header-banner">
                <img src={getImageUrl(`${dayData.image_prompt} real photo`)} alt="Day Banner" />
                <div className="day-title-overlay">
                  <h2>Day {dayData.day}: {dayData.theme}</h2>
                </div>
              </div>
              <div className="day-details">
                <div className="detail-block">
                  <h4>📍 Activities</h4>
                  <ul>{dayData.activities.map((act, i) => <li key={i}>{act}</li>)}</ul>
                </div>
                <div className="detail-block transport-block">
                  <h4>🚕 Transport ({dayData.transport_mode})</h4>
                  <p>{dayData.transport_tip}</p>
                </div>
                <div className="detail-block food-block">
                  <h4>🥘 Suggested Food Stop</h4>
                  <div className="mini-food-card" onClick={() => openMap(dayData.nearby_food_stop)}>
                    <img src={getImageUrl(`${dayData.nearby_food_stop} food`)} alt="Food" />
                    <div><strong>{dayData.nearby_food_stop}</strong><span>(Click for Map)</span></div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )
    }

    switch(currentSlide) {
      case 0: 
        return (
          <div className="slide-content form-slide">
             <div className="glow-orb"></div>
             <header className="hero">
                <h1>TRIPWISE</h1>
                <p>WHERE WOULD YOU LIKE TO FIND YOUR PEACE?</p>
              </header>
              <div className="form-container glass-panel">
                <form onSubmit={handleSubmit} className="trip-form">
                  <div className="input-group">
                    <label>Destination</label>
                    <div className="input-wrapper">
                      <span className="input-icon">📍</span>
                      <input type="text" name="destination" placeholder="Paris, Bali, New York..." value={formData.destination} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Budget</label>
                      <div className="input-wrapper">
                        <span className="input-icon">💳</span>
                        <input type="number" name="budget" placeholder="50000" value={formData.budget} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Days</label>
                      <div className="input-wrapper">
                        <span className="input-icon">📅</span>
                        <input type="number" name="duration_days" placeholder="5" value={formData.duration_days} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Vibe & Interests</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input type="text" name="interests" placeholder="Cyberpunk, Nature, Food..." value={formData.interests} onChange={handleChange} required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="generate-btn glow-btn">
                    {loading ? <span className="pulsing-text">WE ARE PLANNING YOUR TRIP...</span> : <span>GET READY FOR Trip 🚀</span>}
                  </button>
                  {error && <div className="error-msg">{error}</div>}
                </form>
              </div>
          </div>
        );

      case 1:
        return (
          <div className="slide-content scrollable-slide">
          
            <div className="destination-banner full-screen-banner">
              <img src={getBannerUrl(`${formData.destination} city cinematic travel photography 4k`)} alt="Banner" />
              <div className="banner-overlay center-overlay">
                <h1>Trip to {formData.destination}</h1>
                <div className="total-badge big-badge">Total Est: {tripPlan.total_estimated_cost}</div>
              </div>
            </div>
            
            
            <div className="slide-body">
              <div className="section-header">
                <h3>💰 Cost Breakdown</h3>
              </div>
              <div className="budget-breakdown big-grid">
                <div className="cost-item">
                  <span>🏨 Stay</span>
                  <strong>{tripPlan.cost_breakdown.stay}</strong>
                </div>
                <div className="cost-item">
                  <span>🍲 Food</span>
                  <strong>{tripPlan.cost_breakdown.food}</strong>
                </div>
                <div className="cost-item">
                  <span>🚕 Travel</span>
                  <strong>{tripPlan.cost_breakdown.travel}</strong>
                </div>
                <div className="cost-item">
                  <span>🧗 Activities</span>
                  <strong>{tripPlan.cost_breakdown.activities}</strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="slide-content scrollable-slide">
            <h2>🏨 WHERE TO STAY</h2>
            <p className="sub-hint">Click cards to view on Google Maps</p>
            <div className="cards-grid">
              {tripPlan.hotels.map((item, idx) => (
                <div key={idx} className="card clickable-card" onClick={() => openMap(item.name)}>
                  <div className="card-img">
                    <img src={getImageUrl(`${item.name} hotel ${formData.destination} luxury exterior`)} alt={item.name} />
                    <div className="map-icon">📍 View Map</div>
                  </div>
                  <div className="card-info"><h4>{item.name}</h4><p>⭐ {item.rating} • 💰 {item.price}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="slide-content scrollable-slide">
            <h2>📸 PLACES TO VISIT</h2>
            <div className="cards-grid">
              {tripPlan.places_to_visit.map((item, idx) => (
                <div key={idx} className="card clickable-card" onClick={() => openMap(item.name)}>
                  <div className="card-img">
                    <img src={getImageUrl(`${item.name} ${formData.destination} landmark`)} alt={item.name} />
                    <div className="map-icon">📍 View Map</div>
                  </div>
                  <div className="card-info"><h4>{item.name}</h4><p>🎫 {item.entry_fee} • 🏷️ {item.type}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="slide-content scrollable-slide">
             <h2>🍽️ WHERE TO EAT</h2>
             <div className="cards-grid">
              {tripPlan.restaurants.map((item, idx) => (
                <div key={idx} className="card clickable-card" onClick={() => openMap(item.name)}>
                  <div className="card-img">
                    <img src={getImageUrl(`${item.name} restaurant ${formData.destination} food`)} alt={item.name} />
                    <div className="map-icon">📍 View Map</div>
                  </div>
                  <div className="card-info"><h4>{item.name}</h4><p>🥘 {item.cuisine} • 💵 {item.price_range}</p></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="slide-content scrollable-slide">
            <h2>🗓️ DAY-BY-DAY ITINERARY</h2>
            <div className="timeline">
              {tripPlan.itinerary.map((day, idx) => (
                <div key={idx} className="day-card">
                  <div className="day-image"><img src={getImageUrl(`${day.image_prompt} real photo`)} alt={`Day ${day.day}`} /></div>
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
      
      {tripPlan && currentSlide > 0 && (
        <>
          <button className="nav-arrow left-arrow" onClick={prevSlide}>&#10094;</button>
          <button className="nav-arrow right-arrow" onClick={nextSlide}>&#10095;</button>
        </>
      )}

    
      {tripPlan && (
        <div className="nav-dots">
          {[...Array(5 + tripPlan.itinerary.length).keys()].map(n => (
            <span key={n} className={`dot ${currentSlide === n ? 'active' : ''}`} onClick={() => setCurrentSlide(n === 0 ? 0 : n)}></span>
          ))}
        </div>
      )}
      <div className="slide-container">
        {renderSlide()}
      </div>
    </div>
  )
}

export default App