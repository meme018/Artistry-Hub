import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logimg from "../assets/logorsign1.jpg";
import "../styles/LoginPg.css";
import { useUserStore } from "../store/user.js";

// Error Popup Component
const ErrorPopup = ({ error, banInfo, onClose }) => {
  if (!error) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Login Error</h3>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="popup-body">
          <p className="error-message">{error}</p>
          {banInfo && (
            <div className="ban-info">
              <h4>Account Banned</h4>
              <p>
                <strong>Reason:</strong>{" "}
                {banInfo.reason || "Violation of platform rules"}
              </p>
              <p>
                <strong>Ban Date:</strong> {banInfo.date}
              </p>
              <p className="support-text">
                If you believe this is an error, please contact support.
              </p>
            </div>
          )}
        </div>
        <div className="popup-footer">
          <button className="popup-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function Login() {
  const { loginUser, isAuthenticated, currentUser } = useUserStore();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [banInfo, setBanInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Close popup handler
  const closeErrorPopup = () => {
    setError("");
    setBanInfo(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBanInfo(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.banReason) {
        // User is banned
        setBanInfo({
          reason: data.banReason,
          date: new Date(data.bannedAt).toLocaleDateString(),
        });
        setError(data.message);
      } else if (!response.ok) {
        setError(data.message || "Login failed");
      } else {
        // Process successful login with Zustand store
        const res = await loginUser(user.name, user.password);
        if (!res.success) {
          setError(res.message);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Navigate based on user role
      switch (currentUser.role) {
        case "Admin":
          navigate("/AdminBoard");
          break;
        case "Artist/Organizer":
          navigate("/Artist_Dashboard");
          break;
        case "Attendee":
          navigate("/Home");
          break;
        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="containerLogin">
      <div className="login">
        <div className="Logininfo">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your Username"
              required
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              autoComplete="username"
              disabled={isLoading}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <div className="submitL">
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <p>
            Don't have an account?
            <Link to="/SignupPg"> Signup</Link>
          </p>
        </div>
        <div className="logimg">
          <img src={logimg} alt="Login Illustration" />
        </div>
      </div>

      {/* Error Popup */}
      <ErrorPopup error={error} banInfo={banInfo} onClose={closeErrorPopup} />
    </div>
  );
}

export default Login;
