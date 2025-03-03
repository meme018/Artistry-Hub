import React from "react";
import Calligraphy from "../assets/Calligraphy.jpeg";
import painting from "../assets/painting.jpg";
import sculpt from "../assets/sculpt.jpg";
import "../styles/Home.css";
import EventCard from "../components/EventCard";
import { Box } from "@mui/material";

function Home() {
  return (
    <div className="container">
      <div className="banner">
        <img src={Calligraphy} alt="Calligraphy" />
        <img src={painting} alt="Painting" />
        <img src={sculpt} alt="Sculpture" />
        <div className="banner-text">
          <h2>Artistry HUB</h2>
          <p>Discover the artist in you</p>
        </div>
      </div>

      <h1>Categories</h1>
      <div className="category">
        <h2>Sculpting</h2>
        <h2>Digital Art</h2>
        <h2>Painting</h2>
        <h2>Calligraphy</h2>
        <h2>Embroidery</h2>
      </div>

      <h1>Events</h1>
      <div className="product">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
          <EventCard />
          <EventCard />
          <EventCard />
        </Box>
      </div>
    </div>
  );
}

export default Home;
