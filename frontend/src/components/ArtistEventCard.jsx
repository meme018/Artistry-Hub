import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EventCard.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { format } from "date-fns";

function ArtistEventCard({ event }) {
  const navigate = useNavigate();

  // Handle null event case
  if (!event) return null;

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  // Get location display based on event type
  const getLocationDisplay = () => {
    if (event.Type === "Online") {
      return "Online Event";
    } else if (event.Location && event.Location.Landmark) {
      return `${event.Location.Landmark}, ${event.Location.City || ""}`;
    } else {
      return "Location not specified";
    }
  };

  // Check if event has ended
  const isEventEnded = () => {
    if (!event.Date) return false;

    const eventDate = new Date(event.EventDate);
    const today = new Date();

    // If event end time is available, check that too
    if (event.EndTime) {
      const [hours, minutes] = event.EndTime.split(":").map(Number);
      eventDate.setHours(hours, minutes);
    } else {
      // Default to end of day if no specific end time
      eventDate.setHours(23, 59, 59);
    }

    return today > eventDate;
  };

  // Navigate to event details page
  const handlePreviewClick = () => {
    navigate(`/ArtistEventPage/${event._id}`);
  };

  const eventEnded = isEventEnded();

  // Construct proper image URL
  const imageUrl = event.Image
    ? `http://localhost:5000/${event.Image}`
    : "https://picsum.photos/400/300";

  return (
    <div className={`card ${eventEnded ? "event-ended" : ""}`}>
      {/* Left side: Event banner image */}
      <div className="card-left">
        <img
          className="productimg"
          src={imageUrl}
          alt={event.EventTitle || "Event Banner"}
        />
        {eventEnded && <div className="event-ended-overlay"></div>}
      </div>

      {/* Right side: Event details */}
      <div className="card-right">
        <h1>{event.EventTitle}</h1>
        <p className="event-detail">
          <CalendarMonthIcon />
          <span>Date &amp; Time:</span> {formatEventDate(event.EventDate)},{" "}
          {event.StartTime}
        </p>
        <p className="event-detail">
          <LocationOnIcon />
          <span>Location:</span> {getLocationDisplay()}
        </p>
        <p className="event-detail">
          <span>Event type:</span>{" "}
          <span className="event-type-badge">{event.Type}</span>
        </p>

        <div className="card-actions">
          <button
            onClick={handlePreviewClick}
            className={eventEnded ? "preview-ended-btn" : "preview-btn"}
          >
            {eventEnded ? "View Past Event" : "Preview Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArtistEventCard;
