import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  EventAvailable,
  ErrorOutline,
  AccessTime,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import "../styles/Ticket.css";
import { useUserStore } from "../store/user";
import { CircularProgress, Tab, Tabs, Box } from "@mui/material";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Approved, 2: Pending, 3: Rejected
  const { token, validateAuth } = useUserStore();
  const navigate = useNavigate();

  // Fetch tickets on component mount
  useEffect(() => {
    const isAuthenticated = validateAuth();
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/tickets",
          message: "Please log in to view your tickets",
        },
      });
      return;
    }

    const fetchTickets = async () => {
      if (!token) return;

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
        setTickets(data.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, validateAuth, navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return "Date not specified";
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Filter tickets based on active tab
  const filteredTickets = () => {
    switch (activeTab) {
      case 1: // Approved
        return tickets.filter((ticket) => ticket.approvalStatus === "approved");
      case 2: // Pending
        return tickets.filter((ticket) => ticket.approvalStatus === "pending");
      case 3: // Rejected
        return tickets.filter((ticket) => ticket.approvalStatus === "rejected");
      default: // All
        return tickets;
    }
  };

  // Get status icon based on approval status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="status-icon approved" />;
      case "pending":
        return <AccessTime className="status-icon pending" />;
      case "rejected":
        return <Cancel className="status-icon rejected" />;
      default:
        return null;
    }
  };

  // Get status text based on approval status
  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved - Ready to use";
      case "pending":
        return "Pending approval";
      case "rejected":
        return "Request rejected";
      default:
        return "Unknown status";
    }
  };

  // Handle click on event to navigate to event details
  const handleEventClick = (eventId) => {
    navigate(`/EventPage/${eventId}`);
  };

  // Get image URL with proper base path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Check if the image path already includes http or https
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // Otherwise add the server base URL
    return `http://localhost:5000/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading your tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <ErrorOutline className="error-icon" />
        <h2>Error loading tickets</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <h1>Your Tickets</h1>
        <p>View and manage all your event tickets</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All Tickets" />
          <Tab label="Approved" />
          <Tab label="Pending" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

      <div className="tickets-container">
        {filteredTickets().length === 0 ? (
          <div className="no-tickets-message">
            <EventAvailable className="no-tickets-icon" />
            <h3>No tickets found</h3>
            <p>
              {activeTab === 0
                ? "You haven't requested any tickets yet."
                : `You don't have any ${
                    activeTab === 1
                      ? "approved"
                      : activeTab === 2
                      ? "pending"
                      : "rejected"
                  } tickets.`}
            </p>
            <button onClick={() => navigate("/")} className="browse-events-btn">
              Browse Events
            </button>
          </div>
        ) : (
          filteredTickets().map((ticket) => (
            <div
              key={ticket._id}
              className={`ticket-card status-${ticket.approvalStatus}`}
            >
              <div className="ticket-header">
                <div className="ticket-status">
                  {getStatusIcon(ticket.approvalStatus)}
                  <span className={`status-text ${ticket.approvalStatus}`}>
                    {getStatusText(ticket.approvalStatus)}
                  </span>
                </div>
                <div className="ticket-date">
                  Requested on {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div
                className="ticket-content"
                onClick={() => handleEventClick(ticket.event._id)}
              >
                <div className="event-image">
                  {ticket.event.Image ? (
                    <img
                      src={getImageUrl(ticket.event.Image)}
                      alt={ticket.event.EventTitle}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                <div className="ticket-details">
                  <h3 className="event-title">{ticket.event.EventTitle}</h3>

                  <div className="event-type">
                    <span className="event-badge">{ticket.event.Type}</span>
                  </div>

                  <div className="event-datetime">
                    <p className="event-date">
                      {formatEventDate(ticket.event.Date)}
                    </p>
                    <p className="event-time">
                      {ticket.event.StartTime} - {ticket.event.EndTime}
                    </p>
                  </div>

                  <div className="event-location">
                    {ticket.event.Type === "Online" ? (
                      <p>Online Event</p>
                    ) : (
                      <p>
                        {ticket.event.Location?.City ||
                          "Location not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {ticket.approvalStatus === "approved" && ticket.qrCode && (
                <div className="ticket-qr-section">
                  <div className="qr-code">
                    <img src={ticket.qrCode} alt="Ticket QR Code" />
                  </div>
                  <div className="ticket-instructions">
                    <h4>Show this QR code at the event entrance</h4>
                    <p>
                      Your ticket has been approved! Present this QR code to the
                      event staff when you arrive.
                    </p>
                  </div>
                </div>
              )}

              {ticket.approvalStatus === "pending" && (
                <div className="ticket-message pending">
                  <p>
                    Your ticket request is awaiting approval from the organizer.
                  </p>
                </div>
              )}

              {ticket.approvalStatus === "rejected" && (
                <div className="ticket-message rejected">
                  <p>
                    Unfortunately, your ticket request was not approved by the
                    organizer.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Ticket;
