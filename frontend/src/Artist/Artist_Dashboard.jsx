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
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user and event data from stores
  const {
    events,
    fetchEvents,
    fetchArtistEvents,
    checkOngoingEvents,
    error,
    isLoading,
  } = useEventStore();
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
        await fetchArtistEvents(token);

        // Try to get ongoing events directly from API
        const ongoingResult = await checkOngoingEvents(token);
        if (ongoingResult?.success && ongoingResult?.ongoingEvents) {
          setOngoingEvents(ongoingResult.ongoingEvents);
        }

        // Also fetch ticket data
        await fetchPendingTickets();
        await fetchTicketStats();
      } else {
        await fetchEvents();
      }
      setLoading(false);
    };

    loadEvents();
  }, [
    token,
    fetchArtistEvents,
    fetchEvents,
    validateAuth,
    navigate,
    checkOngoingEvents,
  ]);

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
      const response = await fetch("http://localhost:5000/api/tickets/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setTicketStats(data.data || []);
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
    }
  };

  // Filter events by creator and upcoming/past/ongoing
  useEffect(() => {
    if (!events.length || !currentUser) return;

    const now = new Date();

    // Filter events created by the logged-in user
    const artistEvents = events.filter(
      (event) => event.Creator._id === currentUser.id
    );

    // Debug log to see event structure
    console.log("Artist events:", artistEvents);

    // If we didn't get ongoing events from API, filter them manually
    if (ongoingEvents.length === 0) {
      const ongoing = artistEvents.filter((event) => {
        // Use StartDate and EndDate for ongoing events
        if (event.StartDate && event.EndDate) {
          const startDate = new Date(event.StartDate);
          const endDate = new Date(event.EndDate);
          return startDate <= now && endDate >= now;
        }
        return false;
      });
      setOngoingEvents(ongoing);
    }

    // Filter upcoming events (StartDate is in the future)
    const upcoming = artistEvents.filter((event) => {
      if (event.StartDate) {
        const startDate = new Date(event.StartDate);
        return startDate > now;
      }
      return false;
    });

    // Filter past events (EndDate is in the past)
    const past = artistEvents.filter((event) => {
      if (event.EndDate) {
        const endDate = new Date(event.EndDate);
        return endDate < now;
      }
      return false;
    });

    setUpcomingEvents(upcoming);
    setPastEvents(past);

    // If we don't have ticket stats from the backend, calculate from events
    if (!ticketStats.length) {
      const calculatedStats = artistEvents.map((event) => ({
        eventId: event._id,
        eventTitle: event.EventTitle,
        eventDate: event.EventDate, // Use EventDate for display
        startDate: event.StartDate,
        endDate: event.EndDate,
        totalTickets: event.TicketQuantity || 0,
        bookedTickets: Math.max(
          0,
          (event.TicketQuantity || 0) - (event.TicketsAvailable || 0)
        ),
      }));
      setTicketStats(calculatedStats);
    }
  }, [events, currentUser, ticketStats.length, ongoingEvents.length]);

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
    const artistEvents = events.filter(
      (event) => event.Creator._id === currentUser?.id
    );

    const totalTickets = artistEvents.reduce(
      (sum, event) => sum + (event.TicketQuantity || 0),
      0
    );

    const bookedTickets = artistEvents.reduce(
      (sum, event) =>
        sum +
        Math.max(
          0,
          (event.TicketQuantity || 0) - (event.TicketsAvailable || 0)
        ),
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
        rsvp: `${stat.bookedTickets}/${stat.totalTickets}`,
      }));
    }

    // Combine all events (upcoming, ongoing, past) for ticket data
    const allArtistEvents = [
      ...upcomingEvents,
      ...ongoingEvents,
      ...pastEvents,
    ];

    if (allArtistEvents.length) {
      return allArtistEvents.map((event) => {
        const bookedTickets = Math.max(
          0,
          (event.TicketQuantity || 0) - (event.TicketsAvailable || 0)
        );
        return {
          eventId: event._id,
          event: event.EventTitle,
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
            <h3>Events ongoing</h3>
            <p>
              {upcomingEvents.length + ongoingEvents.length + pastEvents.length}
            </p>
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
                <th>Event Title</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {currentTicketData.length > 0 ? (
                currentTicketData.map((ticket, index) => (
                  <tr key={ticket.eventId || index}>
                    <td>{ticket.event}</td>
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
                  <td>{ticket.event?.EventTitle || "N/A"}</td>
                  <td>{ticket.user?.name || "N/A"}</td>
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

        {/* Ongoing Events Section */}
        <h2>Your Ongoing Events</h2>
        <div className="Dashboard_product">
          {ongoingEvents.length > 0 ? (
            <Box sx={{ gap: "40px", display: "flex", flexDirection: "column" }}>
              {ongoingEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </Box>
          ) : (
            <p>No ongoing events.</p>
          )}
          {ongoingEvents.length > 3 && (
            <button
              className="dashboard-view-all"
              onClick={() => navigate("/ongoing-events")}
            >
              View All
            </button>
          )}
        </div>

        <h2>Upcoming Events</h2>
        <div className="Dashboard_product">
          {upcomingEvents.length > 0 ? (
            <Box sx={{ gap: "40px", display: "flex", flexDirection: "column" }}>
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </Box>
          ) : (
            <p>No upcoming events.</p>
          )}
          {upcomingEvents.length > 3 && (
            <button
              className="dashboard-view-all"
              onClick={() => navigate("/upcoming-events")}
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
