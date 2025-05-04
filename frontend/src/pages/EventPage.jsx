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
} from "@mui/icons-material";
import { format } from "date-fns";
import "../styles/EventPage.css";
import { useEventStore } from "../store/event";
import { useUserStore } from "../store/user";

const EventPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [newComment, setNewComment] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportingUser, setReportingUser] = useState(null);
  const [reportingFrom, setReportingFrom] = useState(""); // "comment" or "review"
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [organizerInfo, setOrganizerInfo] = useState(null);
  const [loadingOrganizerInfo, setLoadingOrganizerInfo] = useState(false);
  const [ticketRequestStatus, setTicketRequestStatus] = useState(null); // null, "pending", "success", "error"
  const [ticketRequestMessage, setTicketRequestMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Get the necessary functions and state from the event store
  const { getEventById, currentEvent, isLoading, error } = useEventStore();

  const { currentUser, token } = useUserStore();

  // Fetch event details when component mounts
  useEffect(() => {
    if (eventId) {
      getEventById(eventId);
    }
  }, [eventId, getEventById]);

  // Function to fetch organizer info
  const fetchOrganizerInfo = async (organizerId) => {
    if (!organizerId) return;

    setLoadingOrganizerInfo(true);
    try {
      // Fixed endpoint to match the backend route
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
      return dateString; // Fallback to the original string if parsing fails
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

  // Handle ticket request
  const handleTicketRequest = async () => {
    if (!token) {
      navigate("/login", {
        state: {
          from: `/events/${eventId}`,
          message: "Please log in to request a ticket",
        },
      });
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

  // Handle new comment submission
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!token) {
      alert("You must be logged in to post a comment");
      return;
    }

    // Add comment logic would go here
    // For now, just reset the input
    setNewComment("");
  };

  // Handle report user
  const handleReportUser = (username, source) => {
    setReportingUser(username);
    setReportingFrom(source);
    setReportModalOpen(true);
  };

  // Submit report
  const handleSubmitReport = () => {
    // In a real application, you would send this data to your backend
    console.log({
      reportedUser: reportingUser,
      source: reportingFrom,
      reason: reportReason,
      details: reportDetails,
    });

    // Reset and close modal
    setReportReason("");
    setReportDetails("");
    setReportingUser(null);
    setReportModalOpen(false);

    // You could add a confirmation message here
    alert("Report submitted. Thank you for helping keep our community safe.");
  };

  // Toggle organizer modal
  const toggleOrganizerModal = () => {
    setShowOrganizerModal(!showOrganizerModal);
  };

  // View tickets
  const goToTickets = () => {
    navigate("/Ticket");
  };

  // Create dummy data for comments and reviews if they don't exist
  const comments = currentEvent.comments || [
    {
      user: "ArtLover123",
      text: "This sounds amazing! Are supplies included?",
    },
    {
      user: "CreativeSoul",
      text: "Can't wait to join! Will there be feedback sessions?",
    },
  ];

  const reviews = currentEvent.reviews || [
    {
      user: "HappyPainter",
      rating: 4,
      text: "Fantastic workshop! Learned so much about color blending.",
    },
    {
      user: "ArtNewbie",
      rating: 5,
      text: "Perfect for beginners. Highly recommended!",
    },
  ];

  const eventEnded = isEventEnded();

  // Render ticket button based on status
  const renderTicketButton = () => {
    if (eventEnded) {
      return (
        <button className="get-ticket-btn disabled" disabled>
          Event Has Ended
        </button>
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

    // Default: No request yet
    return (
      <button
        className={`get-ticket-btn ${isRequesting ? "requesting" : ""}`}
        onClick={handleTicketRequest}
        disabled={isRequesting}
      >
        {isRequesting ? "Requesting..." : "Get Ticket"}
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
          Discussion
        </button>
        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews {reviews.length > 0 && `(${reviews.length}★)`}
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
                  <p>{formatEventDate(currentEvent.Date)}</p>
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
                <h3>RSVP Tickets</h3>
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

        {/* Rest of the component unchanged */}
        {activeTab === "discussion" && (
          <div className="discussion-section">
            {/* Discussion section content */}
            <div className="comments-container">
              {comments.map((comment, index) => (
                <div key={index} className="comment-card">
                  <div className="user-avatar">
                    <span>{comment.user[0]}</span>
                  </div>
                  <div className="comment-content">
                    <h4>{comment.user}</h4>
                    <p>{comment.text}</p>
                  </div>
                  <button
                    className="report-btn"
                    onClick={() => handleReportUser(comment.user, "comment")}
                  >
                    <Flag fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
            <form className="new-comment" onSubmit={handleSubmitComment}>
              <textarea
                placeholder="Join the discussion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={eventEnded}
              />
              <button
                className="post-btn"
                type="submit"
                disabled={eventEnded || !newComment.trim()}
              >
                <Comment /> Post
              </button>
              {eventEnded && (
                <p className="discussion-closed-message">
                  Discussion for this event has been closed as the event has
                  ended.
                </p>
              )}
            </form>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            <div className="reviews-container">
              {(showAllReviews ? reviews : reviews.slice(0, 2)).map(
                (review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-header">
                      <div className="user-avatar">
                        <span>{review.user[0]}</span>
                      </div>
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`star ${
                              i < review.rating ? "filled" : "empty"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        className="report-btn"
                        onClick={() => handleReportUser(review.user, "review")}
                      >
                        <Flag fontSize="small" />
                      </button>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                )
              )}
            </div>
            {!showAllReviews && reviews.length > 2 && (
              <button
                className="load-more-btn"
                onClick={() => setShowAllReviews(true)}
              >
                Load More Reviews
              </button>
            )}

            {reviews.length === 0 && (
              <div className="no-reviews-message">
                <p>No reviews yet for this event.</p>
              </div>
            )}

            {!eventEnded && (
              <div className="add-review-note">
                <p>Reviews can be submitted after attending the event.</p>
              </div>
            )}
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

      {/* Report User Modal */}
      {reportModalOpen && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h3>Report User: {reportingUser}</h3>
              <button
                className="close-btn"
                onClick={() => setReportModalOpen(false)}
              >
                <Close />
              </button>
            </div>
            <div className="report-modal-content">
              <div className="report-field">
                <label htmlFor="report-reason">Reason for reporting:</label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="offensive">Offensive language</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="report-field">
                <label htmlFor="report-details">Details (optional):</label>
                <textarea
                  id="report-details"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Please provide any additional details about this report..."
                  rows={4}
                />
              </div>
              <div className="report-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="submit-report-btn"
                  onClick={handleSubmitReport}
                  disabled={!reportReason}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;
