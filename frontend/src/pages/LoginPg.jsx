import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logimg from "../assets/logorsign1.jpg";
import "../styles/LoginPg.css";
import { useUserStore } from "../store/user.js";

function Login() {
  const { loginUser } = useUserStore(); // Ensure function name matches store
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const [error, setError] = useState(""); // Store error message

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await loginUser(user.name, user.password);

    if (res.success) {
      // Get user data from Zustand store
      const currentUser = useUserStore.getState().currentUser;

      if (currentUser.role === "Admin") {
        navigate("/Artistbar");
      } else if (currentUser.role === "Attendee") {
        navigate("/");
      } else if (currentUser.role === "Artist/Organizer") {
        navigate("/Artist_Dashboard");
      } else {
        alert("Invalid User Role");
      }
    } else {
      setError(res.message);
    }
  };

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
            />
            {error && <p className="error-message">{error}</p>}{" "}
            {/* Display error */}
            <div className="submitL">
              <button type="submit">Login</button>
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
