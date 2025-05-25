import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  EventNote,
  LocationOn,
  ConfirmationNumber,
  AccountCircle,
  Comment,
  MoreVert,
  Close,
  Flag,
  Send,
  Refresh,
} from "@mui/icons-material";
import { format } from "date-fns";
import "../styles/ArtistEventPage.css";
import { useEventStore } from "../store/event";
import { useUserStore } from "../store/user";

const ArtistEventPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [newComment, setNewComment] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [artistEvents, setArtistEvents] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportingUser, setReportingUser] = useState(null);
  const [reportingFrom, setReportingFrom] = useState("");
  const navigate = useNavigate();
  const { eventId } = useParams();

  // Get the necessary functions and state from the event store
  const {
    getEventById,
    deleteEvent,
    currentEvent,
    isLoading,
    error,
    events,
    fetchEvents,
  } = useEventStore();

  const { currentUser, token } = useUserStore();

  // Fetch event details when component mounts
  useEffect(() => {
    if (eventId) {
      getEventById(eventId);
    }

    // Fetch all events to count user events
    fetchEvents();
  }, [eventId, getEventById, fetchEvents]);

  // Calculate number of events created by this organizer
  useEffect(() => {
    if (currentEvent && events.length > 0) {
      const userEvents = events.filter(
        (event) => event.Creator === currentEvent.Creator
      );
      setArtistEvents(userEvents);
    }
  }, [events, currentEvent]);

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

  // Handle loading and error states
  if (isLoading)
    return <div className="loading-container">Loading event details...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!currentEvent)
    return <div className="not-found-container">Event not found.</div>;

  // Get real artist data
  const artistData = {
    username: currentEvent.Organizer || currentUser?.name || "Event Organizer",
    bio: currentUser?.bio || "This artist hasn't added a bio yet.",
    eventsCreated: artistEvents.length || 0,
    profileImage: currentEvent.OrganizerImage || null,
  };

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

  // Function to get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "#ff4444";
      case "Artist/Organizer":
        return "#4CAF50";
      case "Attendee":
        return "#2196F3";
      default:
        return "#666";
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

  // Handle edit event
  const handleEditEvent = () => {
    navigate(`/EditEventPage/${eventId}`);
    setShowOptionsMenu(false);
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const result = await deleteEvent(eventId, token);

        if (result.success) {
          navigate("/OngoingEvent"); // Redirect after successful deletion
        } else {
          alert(`Failed to delete event: ${result.message}`);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("An error occurred while deleting the event.");
      }
    }
    setShowOptionsMenu(false);
  };

  // Get location display
  const getLocationDisplay = () => {
    if (currentEvent.Type === "Online") {
      return "Online Event";
    } else if (currentEvent.Location) {
      return `${currentEvent.Location.Landmark || ""}, ${
        currentEvent.Location.City || ""
      }, ${currentEvent.Location.Country || ""}`;
    } else {
      return "Location not specified";
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

  // Toggle organizer modal
  const toggleOrganizerModal = () => {
    setShowOrganizerModal(!showOrganizerModal);
  };

  const eventEnded = isEventEnded();
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
              <img src={imageUrl} alt="Event" className="event-image" />
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

        {/* Options Menu (3-dot menu) - Now visible for all users */}
        <div className="options-menu-container">
          <button
            className="options-button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreVert />
          </button>

          {showOptionsMenu && (
            <div className="options-dropdown">
              <button onClick={handleEditEvent}>Edit Event</button>
              <button onClick={handleDeleteEvent}>Delete Event</button>
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
                      {artistData.profileImage ? (
                        <img
                          src={artistData.profileImage}
                          alt={artistData.username}
                          className="organizer-image"
                        />
                      ) : (
                        <AccountCircle fontSize="large" />
                      )}
                    </div>
                    <p className="organizer-name">{artistData.username}</p>
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
                  value={currentEvent.TicketsAvailable || 0}
                  max={currentEvent.TicketQuantity || 0}
                />
                <p>
                  Available: {currentEvent.TicketsAvailable || 0}/
                  {currentEvent.TicketQuantity || 0}
                </p>
              </div>
              <button
                className={`get-ticket-btn ${eventEnded ? "disabled" : ""}`}
                disabled={eventEnded}
              >
                {eventEnded ? "Event Has Ended" : "Available"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "discussion" && (
          <div
            className="discussion-section"
            style={{ height: "82vh", minHeight: "50vh" }}
          >
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

            <div className="organizer-profile">
              <div className="organizer-header">
                <div className="organizer-avatar-large">
                  {artistData.profileImage ? (
                    <img
                      src={artistData.profileImage}
                      alt={artistData.username}
                      className="organizer-image-large"
                    />
                  ) : (
                    <div className="organizer-placeholder">
                      <AccountCircle style={{ fontSize: 80 }} />
                    </div>
                  )}
                </div>
                <h2>{artistData.username}</h2>
              </div>

              <div className="organizer-stats">
                <div className="stat-item">
                  <h3>Events Created</h3>
                  <p>{artistData.eventsCreated}</p>
                </div>
              </div>

              <div className="organizer-bio">
                <h3>About</h3>
                <p>{artistData.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistEventPage;
