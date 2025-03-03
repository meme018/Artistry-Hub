import React from "react";

function EventPage() {
  return (
    <div className="EventPage">
      <div className="EventPage-banner">
        <p>Event banner is here</p>
        <div className="EventPage-banner-overlay">
          <h2>Mastering the Art of Expression: A Journey Through Colors</h2>
          <p>Event Type: Offline-indoors</p>
        </div>
      </div>
      <div className="EventPage-content">
        <div className="EventPage-description">
          <h2>About the event</h2>
          <p>
            Dive into a world of creativity and self-expression in this hands-on
            painting workshop! Whether you're a seasoned artist or just
            beginning your artistic journey, this event offers something for
            everyone. Explore techniques in brushwork, color blending, and
            composition as you bring your imagination to life on canvas. Guided
            by professional painters, you'll learn tips and tricks to enhance
            your skills and discover your unique artistic style. Come prepared
            to get inspired, make new friends, and create a masterpiece you’ll
            be proud of. All materials are provided, and no prior experience is
            necessary—just bring your enthusiasm and a love for art!
          </p>
        </div>
        <div className="EventPage-ticket">
          <h2>RSVP Ticket</h2>
          <p>Available Tickets: 27</p>
          <p>Total Tickets: 35</p>
          <button>Get Ticket</button>
        </div>
      </div>
      <div className="EventPage-details">
        <div className="EventPage-details-info">
          <div className="EventPage-details-info-date">
            <h3>Date & Time</h3>
            <p>Saturday, January 18, 2023</p>
            <p>10:00 AM - 1:00 PM</p>
          </div>
          <div className="EventPage-details-info-location">
            <h3>Location</h3>
            <p>Art Studio</p>
            <p>123 Main Street, New York, NY 10001</p>
          </div>
        </div>
        <div className="EventPage-details-organizer">
          <div className="EventPage-details-organizer-image">
            <p>For image</p>
          </div>
          <div className="EventPage-details-organizer-info">
            <h3>Organizer/Artist</h3>
            <h4>Your name</h4>
          </div>
        </div>
      </div>
      <div>
        <h2>Discussion Board</h2>
      </div>
      <div>
        <h2>Rating and review</h2>
      </div>
    </div>
  );
}

export default EventPage;
