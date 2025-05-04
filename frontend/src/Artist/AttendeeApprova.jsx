import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Artistbar from "../components/Artistbar.jsx";
import "../styles/AttendeeApproval.css";
import { CircularProgress } from "@mui/material";
import { useUserStore } from "../store/user.js";

function AttendeeApproval() {
  const navigate = useNavigate();
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    event: "all", // filter by event
    status: "pending", // default to pending
  });

  // Get user auth info from store
  const { token, validateAuth } = useUserStore();

  // Check authentication and fetch pending tickets on component mount
  useEffect(() => {
    const isAuthenticated = validateAuth();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPendingTickets = async () => {
      setLoading(true);
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
        setPendingTickets(data.data);
      } catch (err) {
        console.error("Error fetching pending tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPendingTickets();
    }
  }, [token, validateAuth, navigate]);

  // Handle ticket approval/rejection
  const handleTicketStatus = async (ticketId, status) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }), // 'approved' or 'rejected'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${status} ticket`);
      }

      // Update the local state to reflect the change
      setPendingTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket._id !== ticketId)
      );
    } catch (err) {
      console.error(`Error updating ticket status:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique events for filtering
  const events = [
    ...new Set(
      pendingTickets.map(
        (ticket) => ticket.event?.EventTitle || "Unknown Event"
      )
    ),
  ];

  // Filter tickets based on selected filters
  const filteredTickets = pendingTickets.filter((ticket) => {
    if (filters.event !== "all" && ticket.event?.EventTitle !== filters.event) {
      return false;
    }
    if (filters.status !== "all" && ticket.approvalStatus !== filters.status) {
      return false;
    }
    return true;
  });

  if (loading && pendingTickets.length === 0) {
    return (
      <div className="attendee-approval-page">
        <div className="artist-sidebar">
          <Artistbar />
        </div>
        <div className="loading-container">
          <CircularProgress />
          <p>Loading attendee requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendee-approval-page">
      {/* <div className="artist-sidebar">
        <Artistbar />
      </div> */}
      <div className="approval-content">
        <h1>Attendee Approval</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="event-filter">Event:</label>
            <select
              id="event-filter"
              value={filters.event}
              onChange={(e) =>
                setFilters({ ...filters, event: e.target.value })
              }
            >
              <option value="all">All Events</option>
              {events.map((event, index) => (
                <option key={index} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="no-tickets-message">
            <p>No pending ticket requests found.</p>
          </div>
        ) : (
          <div className="tickets-table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Event</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="attendee-info">
                      <div className="attendee-profile">
                        {ticket.user?.profileImage ? (
                          <img
                            src={ticket.user.profileImage}
                            alt={ticket.user?.name || "User"}
                            className="attendee-avatar"
                          />
                        ) : (
                          <div className="attendee-avatar-placeholder">
                            {(ticket.user?.name || "User").charAt(0)}
                          </div>
                        )}
                        <div className="attendee-details">
                          <span className="attendee-name">
                            {ticket.user?.name || "Unknown User"}
                          </span>
                          <span className="attendee-email">
                            {ticket.user?.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{ticket.event?.EventTitle || "Unknown Event"}</td>
                    <td>
                      {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${ticket.approvalStatus}`}
                      >
                        {ticket.approvalStatus}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {ticket.approvalStatus === "pending" && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() =>
                              handleTicketStatus(ticket._id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleTicketStatus(ticket._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {ticket.approvalStatus !== "pending" && (
                        <span className="action-complete">
                          {ticket.approvalStatus === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendeeApproval;
