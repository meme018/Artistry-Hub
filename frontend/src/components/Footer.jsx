import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="brand-name">
            Artistry <strong>HUB</strong>
          </span>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <a href="#">About</a>
            <a href="#">Help</a>
          </div>
          <div className="footer-column">
            <a href="#">Profile</a>
          </div>
        </div>
      </div>
      <hr className="footer-divider" />
      <p className="footer-copyright">© 2025 me All rights reserved</p>
    </footer>
  );
}

export default Footer;
