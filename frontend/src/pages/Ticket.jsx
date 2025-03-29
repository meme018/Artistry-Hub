import React from "react";
import "../styles/Ticket.css";

const Ticket = () => {
  const events = [
    {
      title: "Mastering the Art of Expression: A Journey Through Colors",
      type: "Offline-Indoor",
      date: "Friday, 10 Jan",
      time: "11:00 - 15:30",
      location: {
        landmark: "Art Center",
        city: "Kathmandu",
        country: "Nepal",
      },
    },
    {
      title: "Mastering the Art of Expression: A Journey Through Colors",
      type: "Offline-Indoor",
      date: "Friday, 10 Jan",
      time: "11:00 - 15:30",
      location: {
        landmark: "Art Center",
        city: "Kathmandu",
        country: "Nepal",
      },
    },
  ];

  return (
    <div className="ticket-container">
      {events.map((event, index) => (
        <div key={index} className="ticket">
          <div className="ticket-left">
            <h2 className="event-title">{event.title}</h2>
            <div className="event-type">Event type : {event.type}</div>
          </div>
          <div className="ticket-right">
            <div className="event-info">
              <p className="info-title">
                <span className="icon">📅</span> Date and Time
              </p>
              <p>{event.date}</p>
              <p>{event.time}</p>
            </div>
            <div className="event-info">
              <p className="info-title">
                <span className="icon">📍</span> Location
              </p>
              <p>
                <strong>Landmark:</strong> {event.location.landmark}
              </p>
              <p>
                <strong>City:</strong> {event.location.city}
              </p>
              <p>
                <strong>Country:</strong> {event.location.country}
              </p>
            </div>
          </div>
          <div className="qr-code">QR</div>
        </div>
      ))}
    </div>
  );
};

export default Ticket;
