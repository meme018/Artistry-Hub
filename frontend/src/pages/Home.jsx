import React, { useEffect } from "react";
import Calligraphy from "../assets/Calligraphy.jpeg";
import painting from "../assets/painting.jpg";
import sculpt from "../assets/sculpt.jpg";
import "../styles/Home.css";
import EventCard from "../components/EventCard";
import {
  Terrain,
  Computer,
  Palette,
  TextFields,
  Style,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "../store/event";

function Home() {
  const navigate = useNavigate();

  // Get events and functions from the store
  const { events, fetchEvents, isLoading } = useEventStore();

  // Fetch all events when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = [
    { name: "Sculpting", icon: <Terrain />, color: "#5D4E6D" },
    { name: "Digital Art", icon: <Computer />, color: "#1282A2" },
    { name: "Painting", icon: <Palette />, color: "#A8578D" },
    { name: "Calligraphy", icon: <TextFields />, color: "#70C9C9" },
    { name: "Embroidery", icon: <Style />, color: "#D9A5B3" },
  ];

  // Get the 3 most recent events to display
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="container">
      {/* Banner Section */}
      <div className="banner">
        <div className="banner-images">
          <img src={Calligraphy} alt="Calligraphy" />
          <img src={painting} alt="Painting" />
          <img src={sculpt} alt="Sculpture" />
        </div>
        <div className="banner-text">
          <h2>Artistry HUB</h2>
          <p>Discover the artist in you</p>
        </div>
      </div>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Categories</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className="category-card"
              onClick={() => navigate(`/SearchPage?category=${category.name}`)}
            >
              <div
                className="category-circle"
                style={{ backgroundColor: category.color }}
              >
                <div className="category-icon">{category.icon}</div>
              </div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <h2>Featured Events</h2>
        <div className="events-list">
          {isLoading ? (
            <div className="loading-message">Loading events...</div>
          ) : featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <div className="no-events-message">
              <p>No events available at the moment.</p>
            </div>
          )}
        </div>
        <div className="event-actions">
          <button
            className="view-events"
            onClick={() => navigate("/SearchPage")}
          >
            View All Events
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
