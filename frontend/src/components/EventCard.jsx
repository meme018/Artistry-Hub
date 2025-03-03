import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard() {
  const navigate = useNavigate();

  return (
    <div className="card">
      {/* Left side: Event banner image */}
      <div className="card-left">
        {/* <Box
          component="img"
          className="productimg"
          // Example placeholder; replace with your actual image src
          src="https://unsplash.com/photos/brown-and-grey-trees-and-rock-formation-painting-wKlHsooRVbg"
          alt="Event Banner"
        /> */}
        <img
          className="productimg"
          src="https://picsum.photos/400/300" // Example placeholder
          alt="Event Banner"
        />
      </div>

      {/* Right side: Event details */}
      <div className="card-right">
        <h1>Mastering the Art of Expression: A Journey Through Colors</h1>
        <p className="event-detail">
          <span>Date &amp; Time:</span> March 5, 2025, 2:00 PM
        </p>
        <p className="event-detail">
          <span>Location:</span> Art Center, Main Hall
        </p>
        <p className="event-detail">
          <span>Event type:</span> Offline - Indoor
        </p>

        <button onClick={() => navigate(`/EventPage/`)}>View Event</button>
      </div>
    </div>
  );
}

export default ProductCard;
