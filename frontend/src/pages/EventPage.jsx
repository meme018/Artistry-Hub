import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  EventNote,
  LocationOn,
  ConfirmationNumber,
  AccountCircle,
  Comment,
  Flag,
  Close,
  Send,
  Refresh,
} from "@mui/icons-material";
import { format } from "date-fns";
import "../styles/EventPage.css";
import { useEventStore } from "../store/event";
import { useUserStore } from "../store/user";
import KhaltiPayment from "../components/KhaltiPayment.jsx";

const EventPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [newComment, setNewComment] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportingUser, setReportingUser] = useState(null);
  const [reportingFrom, setReportingFrom] = useState("");
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [organizerInfo, setOrganizerInfo] = useState(null);
  const [loadingOrganizerInfo, setLoadingOrganizerInfo] = useState(false);
  const [ticketRequestStatus, setTicketRequestStatus] = useState(null);
  const [ticketRequestMessage, setTicketRequestMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { eventId } = useParams();
  const navigate = useNavigate();

  const { getEventById, currentEvent, isLoading, error } = useEventStore();
  const { currentUser, token } = useUserStore();

  // Fetch event details when component mounts
  useEffect(() => {
    if (eventId) {
      getEventById(eventId);
    }
  }, [eventId, getEventById]);

  // Fetch discussions when switching to discussion tab or when eventId changes
  useEffect(() => {
    if (activeTab === "discussion" && eventId) {
      fetchDiscussions();
    }
  }, [activeTab, eventId]);

  // Auto-refresh discussions every 10 seconds when on discussion tab
  useEffect(() => {
    let interval;
    if (activeTab === "discussion" && eventId) {
      interval = setInterval(() => {
        fetchDiscussions(true); // Silent refresh
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, eventId]);

  // Fetch discussions from API
  const fetchDiscussions = async (silent = false) => {
    if (!silent) setLoadingDiscussions(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/discussions/${eventId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data.data || []);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      if (!silent) {
        // Only show error for non-silent requests
        alert("Failed to load discussions. Please try again.");
      }
    } finally {
      if (!silent) setLoadingDiscussions(false);
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!token) {
      navigate("/login", {
        state: {
          from: `/events/${eventId}`,
          message: "Please log in to join the discussion",
        },
      });
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/discussions/${eventId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post comment");
      }

      const data = await response.json();

      // Add the new comment to the top of the discussions
      setDiscussions((prevDiscussions) => [data.data, ...prevDiscussions]);
      setNewComment(""); // Clear the input
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error.message || "Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };
  // Function to format date for discussions
  const formatDiscussionDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080)
        return `${Math.floor(diffInMinutes / 1440)}d ago`;

      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return "Unknown time";
    }
  };

  // Function to fetch organizer info
  const fetchOrganizerInfo = async (organizerId) => {
    if (!organizerId) return;

    setLoadingOrganizerInfo(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/organizer/${organizerId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organizer information");
      }

      const data = await response.json();
      setOrganizerInfo(data.data);
    } catch (error) {
      console.error("Error fetching organizer info:", error);
    } finally {
      setLoadingOrganizerInfo(false);
    }
  };

  // Check if user already has a ticket for this event
  const checkExistingTicket = async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const existingTicket = data.data.find(
          (ticket) => ticket.event._id === eventId
        );

        if (existingTicket) {
          setTicketRequestStatus(existingTicket.approvalStatus);
          if (existingTicket.approvalStatus === "pending") {
            setTicketRequestMessage(
              "Ticket requested! Waiting for organizer approval."
            );
          } else if (existingTicket.approvalStatus === "approved") {
            setTicketRequestMessage("Your ticket has been approved!");
          } else if (existingTicket.approvalStatus === "rejected") {
            setTicketRequestMessage("Your ticket request was rejected.");
          }
        }
      }
    } catch (error) {
      console.error("Error checking existing ticket:", error);
    }
  };

  // Fetch organizer details when modal is opened
  useEffect(() => {
    if (showOrganizerModal && currentEvent?.Creator?._id && !organizerInfo) {
      fetchOrganizerInfo(currentEvent.Creator._id);
    }
  }, [showOrganizerModal, currentEvent, organizerInfo]);

  // Check if user has an existing ticket on page load
  useEffect(() => {
    if (token && eventId) {
      checkExistingTicket();
    }
  }, [token, eventId]);

  // Handle loading and error states
  if (isLoading)
    return <div className="loading-container">Loading event details...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!currentEvent)
    return <div className="not-found-container">Event not found.</div>;

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

  // Check if event has ended
  const isEventEnded = () => {
    if (!currentEvent.Date) return false;

    const eventDate = new Date(currentEvent.Date);
    const today = new Date();

    if (currentEvent.EndTime) {
      const [hours, minutes] = currentEvent.EndTime.split(":").map(Number);
      eventDate.setHours(hours, minutes);
    } else {
      eventDate.setHours(23, 59, 59);
    }

    return today > eventDate;
  };

  // Get location display
  const getLocationDisplay = () => {
    if (currentEvent.Type === "Online") {
      return "Online Event";
    } else if (currentEvent.Location) {
      const location = currentEvent.Location;
      return `${location.Landmark || ""}, ${location.City || ""}, ${
        location.Country || ""
      }`;
    } else {
      return "Location not specified";
    }
  };

  // Get organizer data
  const organizerData = {
    username: currentEvent.Creator?.name || "Event Organizer",
    bio: currentEvent.Creator?.bio || "This artist hasn't added a bio yet.",
    eventsCreated: organizerInfo?.eventsCreated || 0,
    profileImage: currentEvent.Creator?.profileImage || null,
  };

  // Handle ticket request (for free events)
  const handleTicketRequest = async () => {
    if (!token) {
      navigate("/LoginPg", {
        state: {
          from: `/events/${eventId}`,
          message: "Please log in to request a ticket",
        },
      });
      return;
    }

    if (currentEvent.IsPaid) {
      return;
    }

    setIsRequesting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/request/${eventId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTicketRequestStatus("pending");
        setTicketRequestMessage(
          "Ticket requested! Waiting for organizer approval."
        );
      } else {
        setTicketRequestStatus("error");
        setTicketRequestMessage(
          data.message || "Failed to request ticket. Please try again."
        );
      }
    } catch (error) {
      console.error("Error requesting ticket:", error);
      setTicketRequestStatus("error");
      setTicketRequestMessage("Network error. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    setPaymentSuccess(true);
    setTicketRequestStatus("approved");
    setTicketRequestMessage("Payment successful! Your ticket is confirmed.");
    checkExistingTicket();
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    console.error("Payment error:", errorMessage);
    setTicketRequestStatus("error");
    setTicketRequestMessage(`Payment failed: ${errorMessage}`);
  };

  // Toggle organizer modal
  const toggleOrganizerModal = () => {
    setShowOrganizerModal(!showOrganizerModal);
  };

  // View tickets
  const goToTickets = () => {
    navigate("/Ticket");
  };

  const eventEnded = isEventEnded();

  // Render ticket button based on status and whether the event is paid or free
  const renderTicketButton = () => {
    if (eventEnded) {
      return (
        <button className="get-ticket-btn disabled" disabled>
          Event Has Ended
        </button>
      );
    }

    if (currentEvent.IsPaid) {
      if (ticketRequestStatus === "approved") {
        return (
          <div className="ticket-status approved">
            <button className="get-ticket-btn view" onClick={goToTickets}>
              View Ticket
            </button>
            <p className="ticket-message">{ticketRequestMessage}</p>
          </div>
        );
      }

      return (
        <div className="payment-section">
          <KhaltiPayment
            event={currentEvent}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
          {ticketRequestStatus === "error" && (
            <p className="ticket-error">{ticketRequestMessage}</p>
          )}
        </div>
      );
    }

    if (ticketRequestStatus === "pending") {
      return (
        <div className="ticket-status pending">
          <button className="get-ticket-btn pending" disabled>
            Request Pending
          </button>
          <p className="ticket-message">{ticketRequestMessage}</p>
        </div>
      );
    }

    if (ticketRequestStatus === "approved") {
      return (
        <div className="ticket-status approved">
          <button className="get-ticket-btn view" onClick={goToTickets}>
            View Ticket
          </button>
          <p className="ticket-message">{ticketRequestMessage}</p>
        </div>
      );
    }

    if (ticketRequestStatus === "rejected") {
      return (
        <div className="ticket-status rejected">
          <button className="get-ticket-btn rejected" disabled>
            Request Rejected
          </button>
          <p className="ticket-message">{ticketRequestMessage}</p>
        </div>
      );
    }

    return (
      <button
        className={`get-ticket-btn ${isRequesting ? "requesting" : ""}`}
        onClick={handleTicketRequest}
        disabled={isRequesting}
      >
        {isRequesting ? "Requesting..." : "Get Free Ticket"}
      </button>
    );
  };

  const imageUrl = currentEvent.Image
    ? `http://localhost:5000/${currentEvent.Image}`
    : "https://picsum.photos/400/300";

  return (
    <div className="event-page-container">
      {/* Event Banner */}
      <div className="event-banner">
        <div className="event-banner-container">
          <div className="banner-image">
            {currentEvent.Image ? (
              <img
                src={imageUrl}
                alt={currentEvent.EventTitle || "Event Banner"}
                className="event-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>Event Banner Image</span>
              </div>
            )}

            {eventEnded && (
              <div className="event-ended-badge">
                <span>Event Has Ended</span>
              </div>
            )}
          </div>
        </div>

        <div className="banner-content">
          <h1>{currentEvent.EventTitle}</h1>
          <div className="event-type-badge">
            <span>{currentEvent.Type}</span>
          </div>
          {currentEvent.IsPaid && (
            <div className="event-price-badge">
              <span>NPR {currentEvent.Price}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={`tab-btn ${activeTab === "discussion" ? "active" : ""}`}
          onClick={() => setActiveTab("discussion")}
        >
          Discussion ({discussions.length})
        </button>
      </nav>

      {/* Content Sections */}
      <div className="content-container">
        {activeTab === "about" && (
          <div className="about-section">
            <div className="event-info">
              <h2>About the Event</h2>
              <p>{currentEvent.Description}</p>

              <div className="details-grid">
                <div className="detail-card">
                  <EventNote className="detail-icon" />
                  <h3>Date & Time</h3>
                  <p>{formatEventDate(currentEvent.EventDate)}</p>
                  <p>
                    {currentEvent.StartTime} - {currentEvent.EndTime}
                  </p>
                </div>

                <div className="detail-card">
                  <LocationOn className="detail-icon" />
                  <h3>Location</h3>
                  <p>{getLocationDisplay()}</p>
                  {currentEvent.Type === "Online" && currentEvent.Link && (
                    <a
                      href={currentEvent.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="online-link"
                    >
                      Join Event
                    </a>
                  )}
                </div>

                <div className="detail-card organizer-card">
                  <h3>Artist/Organizer</h3>
                  <div
                    className="organizer-info"
                    onClick={toggleOrganizerModal}
                  >
                    <div className="organizer-avatar">
                      {organizerData.profileImage ? (
                        <img
                          src={organizerData.profileImage}
                          alt={organizerData.username}
                          className="organizer-image"
                        />
                      ) : (
                        <AccountCircle fontSize="large" />
                      )}
                    </div>
                    <p className="organizer-name">{organizerData.username}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-section">
              <div className="ticket-header">
                <ConfirmationNumber className="ticket-icon" />
                <h3>{currentEvent.IsPaid ? "Paid Tickets" : "RSVP Tickets"}</h3>
                {currentEvent.IsPaid && (
                  <span className="ticket-price">NPR {currentEvent.Price}</span>
                )}
              </div>
              <div className="ticket-availability">
                <progress
                  value={
                    currentEvent.TicketQuantity -
                    (currentEvent.TicketsAvailable || 0)
                  }
                  max={currentEvent.TicketQuantity || 0}
                />
                <p>
                  Attendees:{" "}
                  {currentEvent.TicketQuantity -
                    (currentEvent.TicketsAvailable || 0)}
                  /{currentEvent.TicketQuantity || 0}
                </p>
              </div>
              {renderTicketButton()}
              {ticketRequestStatus === "error" && (
                <p className="ticket-error">{ticketRequestMessage}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "discussion" && (
          <div className="discussion-section" style={{ height: "89vh" }}>
            <div className="discussion-header">
              <h2>Event Discussion</h2>
              <button
                className="refresh-btn"
                onClick={() => fetchDiscussions()}
                disabled={loadingDiscussions}
              >
                <Refresh /> Refresh
              </button>
            </div>

            {/* Comment Form */}
            <form className="new-comment-form" onSubmit={handleSubmitComment}>
              {/* Discussion Messages */}
              <div className="discussions-container">
                {loadingDiscussions ? (
                  <div className="loading-discussions">
                    <p>Loading discussions...</p>
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="no-discussions">
                    <p>
                      No discussions yet. Be the first to start the
                      conversation!
                    </p>
                  </div>
                ) : (
                  <div className="discussions-list">
                    {discussions.map((discussion) => (
                      <div key={discussion._id} className="discussion-card">
                        <div className="discussion-header-info">
                          <div className="user-avatar">
                            <AccountCircle />
                          </div>
                          <div className="user-info">
                            <div className="user-name-role">
                              <h4>{discussion.user?.name || "Anonymous"}</h4>
                            </div>
                            <p className="discussion-time">
                              {formatDiscussionDate(discussion.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="discussion-content">
                          <p>{discussion.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="comment-input-container">
                <textarea
                  placeholder={
                    token
                      ? "Join the discussion..."
                      : "Please log in to join the discussion"
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={eventEnded || !token || submittingComment}
                  rows={3}
                />
                <button
                  className="post-comment-btn"
                  type="submit"
                  disabled={
                    eventEnded ||
                    !token ||
                    !newComment.trim() ||
                    submittingComment
                  }
                >
                  {submittingComment ? (
                    <>Posting... </>
                  ) : (
                    <>
                      <Send fontSize="small" /> Post
                    </>
                  )}
                </button>
              </div>
              {eventEnded && (
                <p className="discussion-closed-message">
                  Discussion for this event has been closed as the event has
                  ended.
                </p>
              )}
              {!token && (
                <p className="login-message">
                  <a href="/login">Log in</a> to join the discussion
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Artist/Organizer Modal */}
      {showOrganizerModal && (
        <div className="organizer-modal-overlay">
          <div className="organizer-modal">
            <button className="close-modal-btn" onClick={toggleOrganizerModal}>
              <Close />
            </button>

            {loadingOrganizerInfo ? (
              <div className="loading-organizer">
                Loading organizer information...
              </div>
            ) : (
              <div className="organizer-profile">
                <div className="organizer-header">
                  <div className="organizer-avatar-large">
                    {organizerData.profileImage ? (
                      <img
                        src={organizerData.profileImage}
                        alt={organizerData.username}
                        className="organizer-image-large"
                      />
                    ) : (
                      <div className="organizer-placeholder">
                        <AccountCircle style={{ fontSize: 80 }} />
                      </div>
                    )}
                  </div>
                  <h2>{organizerData.username}</h2>
                </div>

                <div className="organizer-stats">
                  <div className="stat-item">
                    <h3>Events Created</h3>
                    <p>{organizerData.eventsCreated}</p>
                  </div>
                </div>

                <div className="organizer-bio">
                  <h3>About</h3>
                  <p>{organizerData.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;
