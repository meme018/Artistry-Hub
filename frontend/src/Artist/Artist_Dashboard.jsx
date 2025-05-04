import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Artistbar from "../components/Artistbar.jsx";
import "../styles/Artist_Dashboard.css";
import EventCard from "../components/ArtistEventCard.jsx";
import { Box, CircularProgress } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useEventStore } from "../store/event.js";
import { useUserStore } from "../store/user.js";

function Artist_Dashboard() {
  const navigate = useNavigate();
  const [ticketPage, setTicketPage] = useState(1);
  const ticketsPerPage = 3;

  // State for events and tickets
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState([]); // New state for ticket statistics
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
      // Use fetchArtistEvents if token is available
      if (token) {
        await fetchArtistEvents(token);
        // Also fetch ticket data
        await fetchPendingTickets();
        await fetchTicketStats();
      } else {
        await fetchEvents();
      }
      setLoading(false);
    };

    loadEvents();
  }, [token, fetchArtistEvents, fetchEvents, validateAuth, navigate]);

  // Fetch pending tickets
  const fetchPendingTickets = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tickets/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending tickets");
      }

      const data = await response.json();
      setPendingTickets(data.data || []);
    } catch (error) {
      console.error("Error fetching pending tickets:", error);
    }
  };

  // Fetch ticket statistics for artist's events
  const fetchTicketStats = async () => {
    try {
      // This endpoint would need to be implemented on your backend
      const response = await fetch("http://localhost:5000/api/tickets/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If this endpoint doesn't exist yet, we'll calculate stats from events data
        return;
      }

      const data = await response.json();
      setTicketStats(data.data || []);
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      // Fall back to calculating from events data
    }
  };

  // Filter events by creator and upcoming/past
  useEffect(() => {
    if (!events.length || !currentUser) return;

    const now = new Date();

    // Filter events created by the logged-in user using _id
    const userEvents = events.filter(
      (event) => event.Creator._id === currentUser.id
    );

    // Separate into upcoming and past events
    const upcoming = userEvents.filter((event) => new Date(event.Date) >= now);
    const past = userEvents.filter((event) => new Date(event.Date) < now);

    setUpcomingEvents(upcoming);
    setPastEvents(past);

    // If we don't have ticket stats from the backend, calculate from events
    if (!ticketStats.length) {
      const calculatedStats = userEvents.map((event) => ({
        eventId: event._id,
        eventTitle: event.EventTitle,
        date: event.Date,
        totalTickets: event.TicketQuantity || 0,
        bookedTickets: Math.floor(
          event.TicketQuantity - (event.TicketsAvailable || 0)
        ),
      }));
      setTicketStats(calculatedStats);
    }
  }, [events, currentUser, ticketStats.length]);

  // Calculate total RSVPs
  const calculateTotalRSVP = () => {
    if (!ticketStats.length && !events.length) return "0/0";

    // If we have ticket stats from our API, use those for accurate counts
    if (ticketStats.length) {
      const totalTickets = ticketStats.reduce(
        (sum, stat) => sum + (stat.totalTickets || 0),
        0
      );

      const bookedTickets = ticketStats.reduce(
        (sum, stat) => sum + (stat.bookedTickets || 0),
        0
      );

      return `${bookedTickets}/${totalTickets}`;
    }

    // Fallback to calculating from events data
    const userEvents = events.filter(
      (event) => event.Creator._id === currentUser?.id
    );

    const totalTickets = userEvents.reduce(
      (sum, event) => sum + (event.TicketQuantity || 0),
      0
    );

    const bookedTickets = userEvents.reduce(
      (sum, event) =>
        sum + ((event.TicketQuantity || 0) - (event.TicketsAvailable || 0)),
      0
    );

    return `${bookedTickets}/${totalTickets}`;
  };

  // Generate ticket data from actual event/ticket stats
  const generateTicketData = () => {
    if (ticketStats.length) {
      return ticketStats.map((stat) => ({
        eventId: stat.eventId,
        event: stat.eventTitle,
        date: new Date(stat.date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        rsvp: `${stat.bookedTickets}/${stat.totalTickets}`,
      }));
    }

    if (upcomingEvents.length) {
      return upcomingEvents.map((event) => {
        const bookedTickets =
          (event.TicketQuantity || 0) - (event.TicketsAvailable || 0);
        return {
          eventId: event._id,
          event: event.EventTitle,
          date: new Date(event.Date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
          rsvp: `${bookedTickets}/${event.TicketQuantity || 0}`,
        };
      });
    }

    return [];
  };

  const allTicketData = generateTicketData();

  // Calculate total pages
  const totalTicketPages = Math.ceil(allTicketData.length / ticketsPerPage);

  // Get current page data
  const currentTicketData = allTicketData.slice(
    (ticketPage - 1) * ticketsPerPage,
    ticketPage * ticketsPerPage
  );

  // Handle ticket approval
  const handleTicketApproval = async (ticketId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${status} ticket`);
      }

      // Refresh pending tickets after approval/rejection
      await fetchPendingTickets();
    } catch (error) {
      console.error(`Error ${status}ing ticket:`, error);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (ticketPage < totalTicketPages) {
      setTicketPage(ticketPage + 1);
    }
  };

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
              {currentTicketData.length > 0 ? (
                currentTicketData.map((ticket, index) => (
                  <tr key={index}>
                    <td>{ticket.event}</td>
                    <td>{ticket.date}</td>
                    <td>{ticket.rsvp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No ticket data available
                  </td>
                </tr>
              )}
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
          <thead>
            <tr>
              <th>Event</th>
              <th>Attendee</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            {pendingTickets.length > 0 ? (
              pendingTickets.slice(0, 2).map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.event.EventTitle}</td>
                  <td>{ticket.user.name}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleTicketApproval(ticket._id, "approved")
                      }
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleTicketApproval(ticket._id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No pending attendee approvals
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                <button onClick={() => navigate("/AttendeeApprova")}>
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
