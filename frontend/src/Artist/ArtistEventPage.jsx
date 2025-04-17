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
} from "@mui/icons-material";
import { format } from "date-fns";
import "../styles/ArtistEventPage.css";
import { useEventStore } from "../store/event";
import { useUserStore } from "../store/user";

const ArtistEventPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [newComment, setNewComment] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [artistEvents, setArtistEvents] = useState([]);
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

  // Check if the current user is the event creator
  const isEventCreator =
    currentUser && currentEvent && currentUser.id === currentEvent.Creator;

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

  // Handle delete event with token
  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      if (!token) {
        alert("You must be logged in to delete an event");
        return;
      }

      const result = await deleteEvent(eventId, token);

      if (result.success) {
        navigate("/OngoingEvent"); // Redirect after successful deletion
      } else {
        alert(`Failed to delete event: ${result.message}`);
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

  // Toggle organizer modal
  const toggleOrganizerModal = () => {
    setShowOrganizerModal(!showOrganizerModal);
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

  return (
    <div className="event-page-container">
      {/* Event Banner */}
      <div className="event-banner">
        <div className="event-banner-container">
          <div className="banner-image">
            {currentEvent.Image ? (
              <img
                src={currentEvent.Image}
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

        {/* Options Menu (3-dot menu) - Only visible for event creators */}
        {isEventCreator && (
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
        )}
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
                {eventEnded ? "Event Has Ended" : "Get Ticket"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "discussion" && (
          <div className="discussion-section">
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
