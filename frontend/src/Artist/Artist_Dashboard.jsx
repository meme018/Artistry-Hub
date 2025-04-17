import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Artistbar from "../components/Artistbar.jsx";
import "../styles/Artist_Dashboard.css";
import EventCard from "../components/ArtistEventCard.jsx";
import { Box, Pagination, CircularProgress } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useEventStore } from "../store/event.js";
import { useUserStore } from "../store/user.js";

function Artist_Dashboard() {
  const navigate = useNavigate();
  const [ticketPage, setTicketPage] = useState(1);
  const ticketsPerPage = 3;

  // State for events
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user and event data from stores
  const { events, fetchEvents, fetchArtistEvents, error, isLoading } =
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
      // Use fetchArtistEvents if token is available, otherwise use fetchEvents
      if (token) {
        await fetchArtistEvents(token);
      } else {
        await fetchEvents();
      }
      setLoading(false);
    };

    loadEvents();
  }, [token, fetchArtistEvents, fetchEvents, validateAuth, navigate]);

  // Filter events by creator and upcoming/past
  useEffect(() => {
    if (!events.length || !currentUser) return;

    const now = new Date();

    // Filter events created by the logged-in user
    const userEvents = events.filter(
      (event) => event.Creator === currentUser.id
    );

    // Separate into upcoming and past events
    const upcoming = userEvents.filter((event) => new Date(event.Date) >= now);
    const past = userEvents.filter((event) => new Date(event.Date) < now);

    setUpcomingEvents(upcoming);
    setPastEvents(past);
  }, [events, currentUser]);

  // Calculate total RSVPs
  const calculateTotalRSVP = () => {
    if (!events.length) return "0/0";

    const userEvents = events.filter(
      (event) => event.Creator === currentUser?.id
    );

    const totalTickets = userEvents.reduce(
      (sum, event) => sum + (event.TicketQuantity || 0),
      0
    );

    // In a real app, you'd track ticket sales/RSVPs in the database
    // This is a placeholder assuming 40% of tickets are reserved on average
    const reservedTickets = Math.floor(totalTickets * 0.4);

    return `${reservedTickets}/${totalTickets}`;
  };

  // All ticket data - would ideally come from API
  // For now we'll use dummy data but map from real events when possible
  const generateTicketData = () => {
    if (upcomingEvents.length) {
      return upcomingEvents.map((event) => ({
        event: event.EventTitle,
        date: new Date(event.Date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        rsvp: `${Math.floor(event.TicketQuantity * 0.4)}/${
          event.TicketQuantity
        }`,
      }));
    }

    return [
      {
        event: "Mastering the Art of Expression: A Journey Through Colors",
        date: "Saturday, January 18",
        rsvp: "36/70",
      },
      // ... other dummy data
    ];
  };

  const allTicketData = generateTicketData();

  // Calculate total pages
  const totalTicketPages = Math.ceil(allTicketData.length / ticketsPerPage);

  // Get current page data
  const currentTicketData = allTicketData.slice(
    (ticketPage - 1) * ticketsPerPage,
    ticketPage * ticketsPerPage
  );

  // Handle next page
  const handleNextPage = () => {
    if (ticketPage < totalTicketPages) {
      setTicketPage(ticketPage + 1);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (ticketPage > 1) {
      setTicketPage(ticketPage - 1);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="Artist-Dashboard">
      <div className="artist-sidebar">
        <Artistbar />
      </div>
      <div className="Artist-dashboard-container">
        <div className="Artist-dashboard-header">
          <div className="Dashboard-Event">
            <h3>Events Created</h3>
            <p>{upcomingEvents.length + pastEvents.length}</p>
          </div>
          <div className="Dashboard-Event">
            <h3>RSVP Ticket</h3>
            <p>{calculateTotalRSVP()}</p>
          </div>
        </div>

        <h2>Ticket By Event</h2>
        <div className="ticket-table-container">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>RSVP Ticket</th>
              </tr>
            </thead>
            <tbody>
              {currentTicketData.map((ticket, index) => (
                <tr key={index}>
                  <td>{ticket.event}</td>
                  <td>{ticket.date}</td>
                  <td>{ticket.rsvp}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-pagination">
            <div className="pagination-info">
              <span>
                Page {ticketPage} of {Math.max(1, totalTicketPages)}
              </span>
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePrevPage}
                disabled={ticketPage === 1}
              >
                <KeyboardArrowLeftIcon />
              </button>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={
                  ticketPage === totalTicketPages || totalTicketPages === 0
                }
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
        </div>

        <h2>Event Attendee</h2>
        <table>
          {/* Existing attendee table content */}
          <thead>
            <tr>
              <th>Event</th>
              <th>Attendee</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {upcomingEvents[0]?.EventTitle ||
                  "Mastering the Art of Expression"}
              </td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
            {/* You would typically map through attendees here */}
            <tr>
              <td>
                {upcomingEvents[0]?.EventTitle ||
                  "Mastering the Art of Expression"}
              </td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                <button onClick={() => navigate("/AttendeeApproval")}>
                  View All
                </button>
              </td>
            </tr>
          </tfoot>
        </table>

        <h2>Your Events</h2>
        <div className="Dashboard_product">
          {upcomingEvents.length > 0 ? (
            <Box sx={{ gap: "40px", display: "flex", flexDirection: "column" }}>
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </Box>
          ) : (
            <p>
              No upcoming events.{" "}
              <a href="/create-event">Create your first event!</a>
            </p>
          )}
          {upcomingEvents.length > 3 && (
            <button
              className="dashboard-view-all"
              onClick={() => navigate("/artist-events")}
            >
              View All
            </button>
          )}
        </div>

        <h2>Past Events</h2>
        <div className="Dashboard_product">
          {pastEvents.length > 0 ? (
            <Box sx={{ gap: "40px", display: "flex", flexDirection: "column" }}>
              {pastEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </Box>
          ) : (
            <p>No past events.</p>
          )}
          {pastEvents.length > 3 && (
            <button
              className="dashboard-view-all"
              onClick={() => navigate("/past-events")}
            >
              View All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Artist_Dashboard;
