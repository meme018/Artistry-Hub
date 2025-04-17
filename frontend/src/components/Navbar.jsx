import React from "react";
import "../styles/Navbar.css";
import { useNavigate } from "react-router-dom";
import PaletteIcon from "@mui/icons-material/Palette";
import { Link } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useUserStore } from "../store/user.js";

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useUserStore();

  const handleProfileClick = () => {
    if (!currentUser) return;

    // Navigate based on user role
    switch (currentUser.role) {
      case "Admin":
        navigate("/AdminBoard");
        break;
      case "Artist/Organizer":
        navigate("/Artist_Dashboard");
        break;
      case "Attendee":
        navigate("/AttendeeProfile");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="navbar-container">
      <div className="Leftside-navbar">
        <Link>
          <PaletteIcon /> Artistry HUB
        </Link>
      </div>

      <div className="rightside-navbar">
        {/* Before login: show Home, Login, Signup, Search */}
        {!isAuthenticated ? (
          <>
            <Link to="/Home">
              <h2>Home</h2>
            </Link>
            <Link to="/LoginPg">
              <h2>Login</h2>
            </Link>
            <Link to="/SignupPg">
              <h2>Signup</h2>
            </Link>
            <Link to="/SearchPage">
              <h2>Search</h2>
            </Link>
          </>
        ) : (
          /* After login: display role-specific navbar items */
          <>
            {/* Attendee specific links */}
            {currentUser.role === "Attendee" && (
              <>
                <Link to="/Home">
                  <h2>Home</h2>
                </Link>
                <Link to="/SearchPage">
                  <h2>Search</h2>
                </Link>
              </>
            )}

            {/* Artist/Organizer specific links */}
            {currentUser.role === "Artist/Organizer" && (
              <Link to="/CreateEvent">
                <h2>Create Event</h2>
              </Link>
            )}

            {/* Profile icon for all authenticated users */}
            <div className="navbar-profile" onClick={handleProfileClick}>
              <AccountCircleIcon className="navbar-profile-icon" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
