import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import signimg from "../assets/logorsign2.jpg";
import "../styles/SignupPg.css";
import { useUserStore } from "../store/user.js";

function SignupPg() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const { createUser } = useUserStore();
  const navigate = useNavigate(); // Initialize useNavigate

  const handelnewUser = async (e) => {
    e.preventDefault();
    const { success, message } = await createUser(newUser);

    console.log("success", success);
    console.log("message", message);

    if (success) {
      alert("Signup successful! Redirecting to login...");
      navigate("/LoginPg"); // Redirect to login page
    } else {
      alert(`Signup failed: ${message}`);
    }
  };

  return (
    <div className="containerSignup">
      <div className="signup">
        <div className="signimg">
          <img src={signimg} alt="Sign Up" />
        </div>

        <div className="Signupinfo">
          <h2>Sign Up</h2>
          <form onSubmit={handelnewUser}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your Username"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              autoComplete="username"
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              required
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              autoComplete="email"
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="Artist/Organizer">Artist/Organizer</option>
              <option value="Attendee">Attendee</option>
            </select>

            <div className="submitS">
              <button type="submit">Sign Up</button>
            </div>
          </form>
          <p>
            Already have an account?
            <Link to="/LoginPg"> Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPg;
