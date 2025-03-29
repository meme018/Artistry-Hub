import React from "react";
import Artistbar from "../components/Artistbar.jsx";
import "../styles/Artist_Dashboard.css";
import EventCard from "../components/EventCard.jsx";
import { Box } from "@mui/material";

function Artist_Dashboard() {
  return (
    <div className="Artist-Dashboard">
      <div className="artist-sidebar">
        <Artistbar />
      </div>
      <div className="Artist-dashboard-container">
        <div className="Artist-dashboard-header">
          <div className="Dashboard-Event">
            <h3>Event Created</h3>
            <p>3</p>
          </div>
          <div className="Dashboard-Event">
            <h3>RSVP Ticket</h3>
            <p>120/250</p>
          </div>
        </div>

        <h2>Ticket By Event</h2>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>RSVP Ticket</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Saturday, January 18</td>
              <td>36/70</td>
            </tr>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Saturday, January 18</td>
              <td>36/70</td>
            </tr>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Saturday, January 18</td>
              <td>36/70</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                <button>View All</button>
              </td>
            </tr>
          </tfoot>
        </table>

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
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
            <tr>
              <td>Mastering the Art of Expression: A Journey Through Colors</td>
              <td>Username</td>
              <td>
                <button>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                <button>View All</button>
              </td>
            </tr>
          </tfoot>
        </table>

        <h2>Your Events</h2>
        <div className="Dashboard_product">
          <Box sx={{ gap: "40px" }}>
            <EventCard />
            <EventCard />
            <EventCard />
          </Box>
          <button className="dashboard-view-all">View All</button>
        </div>

        <h2>Past Events</h2>
        <div className="Dashboard_product">
          <Box sx={{ gap: "40px" }}>
            <EventCard />
          </Box>
          <button className="dashboard-view-all">View All</button>
        </div>
      </div>
    </div>
  );
}

export default Artist_Dashboard;
