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
  const { events, fetchArtistEvents, checkOngoingEvents, isLoading } =
    useEventStore();
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
      if (token) {
        // Use the API endpoint directly for ongoing events
        const ongoingResult = await checkOngoingEvents(token);
        if (ongoingResult.success && ongoingResult.ongoingEvents) {
          setOngoingEvents(ongoingResult.ongoingEvents);
        } else {
          // Fallback to manual filtering if endpoint fails
          await fetchArtistEvents(token);
          filterOngoingEvents();
        }
      }
      setLoading(false);
    };

    loadEvents();
  }, [token, validateAuth, navigate]);

  // Manual filter for ongoing events as a fallback
  const filterOngoingEvents = () => {
    if (!events.length) return;

    const now = new Date();

    // Filter for ongoing events (current date is between start and end dates)
    const ongoing = events.filter((event) => {
      const startDate = new Date(event.StartDate);
      const endDate = new Date(event.EndDate);
      return startDate <= now && endDate >= now;
    });

    setOngoingEvents(ongoing);
  };

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
        <h2>Ongoing Events</h2>
        {ongoingEvents.length > 0 ? (
          <Box sx={{ gap: "40px", display: "flex", flexDirection: "column" }}>
            {ongoingEvents.map((event) => (
              <ArtistEventCard key={event._id} event={event} />
            ))}
          </Box>
        ) : (
          <div className="no-events-message">
            <p>You don't have any ongoing events.</p>
            <button
              className="create-event-button"
              onClick={() => navigate("/create-event")}
            >
              Create an Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OngoingEvent;
