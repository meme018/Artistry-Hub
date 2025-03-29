import React from "react";
import "../styles/Navbar.css";
import PaletteIcon from "@mui/icons-material/Palette";
import Search from "./Search";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar-container">
      <div className="Leftside-navbar">
        <Link to="/Home">
          <PaletteIcon />
        </Link>
        <Link to="/Home">Artistry HUB</Link>
      </div>
      {/* <div className="Middle-navbar">
        <Search />
      </div> */}
      <div className="rightside-navbar">
        <Link to="/LoginPg">
          <h2>Login</h2>
        </Link>
        <Link to="/SignupPg">
          <h2>Signup</h2>
        </Link>
        <Link to="/SearchPage">
          <h2>Search</h2>
        </Link>
        <Link to="/Ticket">
          <h2>Ticket</h2>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
