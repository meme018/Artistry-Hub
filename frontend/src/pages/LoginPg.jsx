import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logimg from "../assets/logorsign1.jpg";
import "../styles/LoginPg.css";
import { useUserStore } from "../store/user.js";

function Login() {
  const { loginUser, isAuthenticated, currentUser } = useUserStore();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginUser(user.name, user.password);

      if (!res.success) {
        setError(res.message);
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
            {error && <p className="error-message">{error}</p>}
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
    </div>
  );
}

export default Login;
