import React from "react";
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

function Home() {
  const categories = [
    { name: "Sculpting", icon: <Terrain />, color: "#5D4E6D" },
    { name: "Digital Art", icon: <Computer />, color: "#1282A2" },
    { name: "Painting", icon: <Palette />, color: "#A8578D" },
    { name: "Calligraphy", icon: <TextFields />, color: "#70C9C9" },
    { name: "Embroidery", icon: <Style />, color: "#D9A5B3" },
  ];

  const events = [
    {
      title: "Art Festival 2023",
      location: "City Museum",
      time: "10:00 AM - 6:00 PM",
      organizer: "Art Community",
    },
    {
      title: "Digital Art Workshop",
      location: "Creative Hub",
      time: "2:00 PM - 5:00 PM",
      organizer: "Jane Doe",
    },
    {
      title: "Calligraphy Basics",
      location: "Online Event",
      time: "6:00 PM - 8:00 PM",
      organizer: "John Smith",
    },
  ];

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
            <div key={index} className="category-card">
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
        <h2>Events</h2>
        <div className="events-list">
          {events.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              location={event.location}
              time={event.time}
              organizer={event.organizer}
            />
          ))}
        </div>
        <div className="event-actions">
          <button className="view-events">View All</button>
        </div>
      </section>
    </div>
  );
}

export default Home;
