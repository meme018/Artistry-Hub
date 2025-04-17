import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import ArtistEventCard from "../components/ArtistEventCard.jsx";
import Artistbar from "../components/Artistbar.jsx";
import "../styles/Artist_Dashboard.css";
import { useEventStore } from "../store/event.js";
import { useUserStore } from "../store/user.js";
import { useNavigate } from "react-router-dom";

function OngoingEvent() {
  const navigate = useNavigate();
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user and event data from stores
  const { events, fetchEvents, isLoading } = useEventStore();
  const { token, currentUser, validateAuth } = useUserStore();

  // Check authentication and fetch events on component mount
  useEffect(() => {
    const isAuthenticated = validateAuth();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadEvents = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };

    loadEvents();
  }, []);

  // Filter for ongoing events
  useEffect(() => {
    if (!events.length || !currentUser) return;

    const now = new Date();

    // Filter for events created by the logged-in user
    const userEvents = events.filter(
      (event) => event.Creator === currentUser.id
    );

    // Filter for ongoing events (start date passed but end date not yet passed)
    const ongoing = userEvents.filter((event) => {
      const startDate = new Date(event.StartDate);
      const endDate = new Date(event.EndDate);
      return startDate <= now && endDate >= now;
    });

    setOngoingEvents(ongoing);
  }, [events, currentUser]);

  if (loading || isLoading) {
    return (
      <div className="Artist-Dashboard">
        <div className="artist-sidebar">
          <Artistbar />
        </div>
        <div className="Artist-dashboard-container loading-container">
          <CircularProgress />
          <p>Loading ongoing events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Artist-Dashboard">
      <div className="artist-sidebar">
        <Artistbar />
      </div>
      <div className="Artist-dashboard-container">
        {ongoingEvents.length > 0 ? (
          ongoingEvents.map((event) => (
            <ArtistEventCard key={event._id} event={event} />
          ))
        ) : (
          <div className="no-events-message">
            <p>You don't have any ongoing events.</p>
            <button onClick={() => navigate("/create-event")}>
              Create an Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OngoingEvent;
