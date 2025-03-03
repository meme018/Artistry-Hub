import React from "react";
import Face2Icon from "@mui/icons-material/Face2";
import { Link } from "react-router-dom";
import "../styles/Artistbar.css";

function Artistbar() {
  return (
    <div className="artistbar-container">
      <div className="profile">
        <h1>Profile</h1>
        <div className="profile-header">
          <Face2Icon />
          <h2>Elena Carter</h2>
        </div>
        <div className="profile-info">
          <h2>Bio</h2>
          <p>
            I'm Elena Carter, an arts event coordinator passionate about
            bringing creative communities together. I organize exhibitions,
            workshops, and festivals to help artists showcase their work and
            connect with new opportunities.
          </p>
        </div>
      </div>

      <Link to="/Artist_Dashboard">Dashboard</Link>
      <Link to="/CreateEvent">Create Event</Link>
      <Link>Ongoint-event</Link>
      <Link>Edit profile</Link>

      <h3></h3>
    </div>
  );
}

export default Artistbar;
