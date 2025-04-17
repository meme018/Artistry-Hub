import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import "../styles/Ticket.css";
import { useUserStore } from "../store/user";
import { useNavigate } from "react-router-dom";
import { EventNote, LocationOn } from "@mui/icons-material";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, currentUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      navigate("/login", {
        state: {
          from: "/tickets",
          message: "Please log in to view your tickets",
        },
      });
      return;
    }

    // Fetch user's tickets
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, navigate]);

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return "Date not specified";
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, dd MMM yyyy");
    } catch (error) {
      return dateString; // Fallback to the original string if parsing fails
    }
  };

  // Get location display
  const getLocationDisplay = (event) => {
    if (event.Type === "Online") {
      return "Online Event";
    } else if (event.Location) {
      const location = event.Location;
      return {
        landmark: location.Landmark || "Not specified",
        city: location.City || "",
        country: location.Country || "",
      };
    } else {
      return {
        landmark: "Not specified",
        city: "",
        country: "",
      };
    }
  };

  return (
    <div className="ticket-page">
      <h1>My Tickets</h1>

      {loading ? (
        <div className="loading-container">
          <p>Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="no-tickets-message">
          <p>You don't have any approved tickets yet.</p>
          <p>
            <a href="/events">Browse events</a> and request tickets to get
            started!
          </p>
        </div>
      ) : (
        <div className="ticket-container">
          {tickets.map((ticket) => {
            const event = ticket.event;
            const location = getLocationDisplay(event);

            return (
              <div key={ticket._id} className="ticket">
                <div className="ticket-left">
                  <h2 className="event-title">{event.EventTitle}</h2>
                  <div className="event-type">Event type: {event.Type}</div>

                  <div className="ticket-details">
                    <div className="detail-item">
                      <EventNote className="detail-icon" />
                      <div>
                        <p>{formatEventDate(event.Date)}</p>
                        <p>
                          {event.StartTime} - {event.EndTime}
                        </p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <LocationOn className="detail-icon" />
                      <div>
                        {event.Type === "Online" ? (
                          <p>Online Event</p>
                        ) : (
                          <>
                            <p>
                              <strong>Landmark:</strong> {location.landmark}
                            </p>
                            {location.city && (
                              <p>
                                <strong>City:</strong> {location.city}
                              </p>
                            )}
                            {location.country && (
                              <p>
                                <strong>Country:</strong> {location.country}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ticket-right">
                  <div className="qr-code">
                    {ticket.qrCode ? (
                      <img
                        src={ticket.qrCode}
                        alt="Ticket QR Code"
                        className="ticket-qr"
                      />
                    ) : (
                      <div className="qr-placeholder">QR</div>
                    )}
                  </div>
                  <p className="ticket-id">
                    Ticket ID: {ticket._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="attendee-name">
                    {currentUser?.name || "Attendee"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Ticket;
