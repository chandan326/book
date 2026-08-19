import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Globe, Star, Navigation, Building, CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import { apiRequest } from '../services/api';
import './PublisherFinder.css';

export default function PublisherFinder({ selectedBookId }) {
  const [publishers, setPublishers] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default New York
  const [searchRadius, setSearchRadius] = useState(50);
  const [selectedPublisherId, setSelectedPublisherId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyPublishers();
  }, [searchRadius]);

  const loadNearbyPublishers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/publishers/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}`);
      setPublishers(data);
      if (data && data.length > 0) {
        setSelectedPublisherId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load publishers:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publisher-page-container">
      
      {/* 1. Milestone Hero Card */}
      <div className="publisher-hero-card">
        <div className="hero-badge-row">
          <span className="milestone-badge">
            100K Readers Milestone Unlocked
          </span>
          <span className="milestone-subtitle">
            Google Maps Ecosystem Integration
          </span>
        </div>

        <h1 className="hero-title">
          Discover Nearby Publishing Houses & Printing Services
        </h1>

        <p className="hero-desc">
          Your manuscript has achieved high reader retention. Connect directly with nearby traditional publishers, university presses, and self-publishing print studios based on your geolocation.
        </p>
      </div>

      {/* 2. Map & Search Controls Bar */}
      <div className="publisher-controls-bar">
        <div>
          <div className="controls-title">
            <Building size={20} color="#2563EB" /> Verified Publishing Ecosystem ({publishers.length})
          </div>
          <div className="controls-subtitle">
            Showing results within {searchRadius === 5000 ? "Worldwide" : `${searchRadius} miles`} of active location
          </div>
        </div>

        <div className="radius-control">
          <label className="radius-label" htmlFor="radius-select">Radius:</label>
          <select 
            id="radius-select"
            className="radius-select"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
          >
            <option value={10}>10 Miles</option>
            <option value={25}>25 Miles</option>
            <option value={50}>50 Miles</option>
            <option value={100}>100 Miles</option>
            <option value={5000}>Worldwide</option>
          </select>
        </div>
      </div>

      {/* 3. Two-Column Dashboard Layout */}
      <div className="publisher-layout-grid">
        
        {/* Left Column: Publisher Cards List */}
        <div className="publisher-cards-column">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', backgroundColor: '#FFFFFF', borderRadius: '0.75rem' }}>
              Finding nearby publishers...
            </div>
          ) : publishers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', backgroundColor: '#FFFFFF', borderRadius: '0.75rem' }}>
              No publishers found within {searchRadius} miles. Try increasing the search radius.
            </div>
          ) : (
            publishers.map((pub) => {
              const isSelected = selectedPublisherId === pub.id;
              return (
                <div 
                  key={pub.id} 
                  className={`publisher-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPublisherId(pub.id)}
                >
                  <div className="card-header-row">
                    <div className="publisher-icon-badge">
                      <Building size={20} />
                    </div>

                    <div className="publisher-main-info">
                      <span className="type-tag">{pub.publisher_type}</span>
                      <h3 className="publisher-name">{pub.name}</h3>
                    </div>

                    <div className="metrics-badge-group">
                      <div className="rating-badge">
                        <Star size={13} fill="#D97706" /> {pub.rating}
                      </div>
                      <div className="distance-badge">
                        📍 {pub.distance_miles} mi
                      </div>
                    </div>
                  </div>

                  <p className="publisher-desc">
                    {pub.description}
                  </p>

                  <div className="publisher-contact-info">
                    <div className="contact-item">
                      <MapPin size={14} color="#EF4444" /> {pub.address}
                    </div>
                    {pub.phone && (
                      <div className="contact-item">
                        <Phone size={14} /> {pub.phone}
                      </div>
                    )}
                  </div>

                  <div className="card-actions-row">
                    {pub.website && (
                      <a 
                        href={pub.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-primary" 
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={14} /> Visit Publisher Website
                      </a>
                    )}

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(pub.address)}`, '_blank');
                      }}
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                    >
                      <Navigation size={14} /> Directions
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Map Container */}
        <div className="map-column">
          
          {/* Map Header Overlay */}
          <div className="map-header-overlay">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF' }}>
              <MapPin size={16} color="#EF4444" /> Google Maps Integration
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Lat: {userLocation.lat}, Lng: {userLocation.lng}
            </span>
          </div>

          {/* Interactive Map Visual Pins Canvas */}
          <div className="map-canvas-area">
            <div className="map-grid-pattern" />

            {publishers.map((pub, idx) => {
              const isSelected = selectedPublisherId === pub.id;
              // Generate balanced pin positions across map canvas
              const topPos = 20 + ((idx * 22) % 65);
              const leftPos = 18 + ((idx * 24) % 65);

              return (
                <div 
                  key={pub.id}
                  onClick={() => setSelectedPublisherId(pub.id)}
                  className={`map-pin-item ${isSelected ? 'active' : ''}`}
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                >
                  <MapPin size={13} color="#FFFFFF" />
                  <span>{pub.name.split(' ')[0]} ({pub.distance_miles}mi)</span>
                </div>
              );
            })}
          </div>

          {/* Map Footer Overlay */}
          <div className="map-footer-overlay">
            Select any map pin or publisher listing to inspect location, request acquisition, or view directions.
          </div>

        </div>

      </div>

    </div>
  );
}
