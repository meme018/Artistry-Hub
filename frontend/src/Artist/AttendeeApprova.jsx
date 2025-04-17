import React from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
function AttendeeApprova() {
  const navigate = useNavigate();

  const attendeeData = [
    {
      eventName: "Mastering the Art of Expression: A Journey Through Colors",
      username: "art_lover123",
    },
    {
      eventName: "Digital Painting Fundamentals",
      username: "digital_dave",
    },
    {
      eventName: "Sculpture Techniques Workshop",
      username: "clay_master",
    },
    {
      eventName: "Street Art Masterclass",
      username: "spray_artist",
    },
    {
      eventName: "Street Art Masterclass",
      username: "spray_artist",
    },
  ];

  return (
    <div className="Artist-dashboard-container">
      <div className="Attendee-Approval-header">
        <h2>Event Attendee</h2>
        <button onClick={() => navigate("/Artist_Dashboard")}>
          GO Back <ArrowForwardIcon />
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Attendee</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {attendeeData.map((attendee, index) => (
            <tr key={index}>
              <td>{attendee.eventName}</td>
              <td>{attendee.username}</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendeeApprova;
