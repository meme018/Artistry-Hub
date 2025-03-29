import React, { useState } from "react";
import {
  Star,
  EventNote,
  LocationOn,
  ConfirmationNumber,
  AccountCircle,
  Comment,
} from "@mui/icons-material";
import "../styles/EventPage.css";

const EventPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [newComment, setNewComment] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const eventDetails = {
    title: "Mastering the Art of\nExpression: A Journey Through Colors",
    type: "Offline-Indoor",
    description:
      "Dive into a world of creativity and self-expression in this hands-on painting workshop! Whether you're a seasoned artist or just beginning your artistic journey, this event offers something for everyone. Explore techniques in brushwork, color blending, and composition as you bring your imagination to life on canvas. Guided by professional painters, you'll learn tips and tricks to enhance your skills and discover your unique artistic style.Come prepared to get inspired, make new friends, and create a masterpiece you’ll be proud of. All materials are provided, and no prior experience is necessary—just bring your enthusiasm and a love for art!",
    date: "Friday, 10 Jan 2024",
    time: "19:00 - 22:30",
    location: "Creative Hub, Kathmandu, Nepal",
    organizer: "Evangeline Thorne",
    tickets: {
      available: 27,
      total: 35,
    },
  };

  const comments = [
    {
      user: "ArtLover123",
      text: "This sounds amazing! Are supplies included?",
    },
    {
      user: "CreativeSoul",
      text: "Can't wait to join! Will there be feedback sessions?",
    },
    {
      user: "UserX",
      text: "Looking forward to this event!",
    },
    {
      user: "ArtFan",
      text: "What materials will be provided?",
    },
  ];

  const reviews = [
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
    {
      user: "CreativeGuru",
      rating: 3,
      text: "Good experience, but could be better organized.",
    },
  ];

  return (
    <div className="event-page-container">
      {/* Event Banner */}
      <div className="event-banner">
        <div className="banner-image">
          <div className="image-placeholder">
            <span>Event Banner Image</span>
          </div>
        </div>
        <div className="banner-content">
          <h1>{eventDetails.title}</h1>
          <div className="event-type-badge">
            <span>{eventDetails.type}</span>
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
              <p>{eventDetails.description}</p>

              <div className="details-grid">
                <div className="detail-card">
                  <EventNote className="detail-icon" />
                  <h3>Date & Time</h3>
                  <p>{eventDetails.date}</p>
                  <p>{eventDetails.time}</p>
                </div>

                <div className="detail-card">
                  <LocationOn className="detail-icon" />
                  <h3>Location</h3>
                  <p>{eventDetails.location}</p>
                </div>

                <div className="detail-card organizer-card">
                  <h3>Artist/ Organizer</h3>
                  <div className="organizer-info">
                    <div className="organizer-avatar">
                      <AccountCircle fontSize="large" />
                    </div>
                    <p>{eventDetails.organizer}</p>
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
                  value={eventDetails.tickets.available}
                  max={eventDetails.tickets.total}
                />
                <p>
                  Available: {eventDetails.tickets.available}/
                  {eventDetails.tickets.total}
                </p>
              </div>
              <button className="get-ticket-btn">Get Ticket</button>
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
            <div className="new-comment">
              <textarea
                placeholder="Join the discussion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="post-btn">
                <Comment /> Post
              </button>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;
