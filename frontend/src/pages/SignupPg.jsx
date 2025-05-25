import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUser } = useUserStore();
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  // Password validation - at least 5 characters
  const validatePassword = (password) => {
    return password.length >= 5;
  };

  // Form validation function
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      role: "",
    };

    // Validate username
    if (!newUser.name.trim()) {
      newErrors.name = "Username is required";
      valid = false;
    } else if (newUser.name.length < 3) {
      newErrors.name = "Username must be at least 3 characters";
      valid = false;
    }

    // Validate email
    if (!newUser.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(newUser.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Validate password
    if (!newUser.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!validatePassword(newUser.password)) {
      newErrors.password = "Password must be at least 5 characters";
      valid = false;
    }

    // Validate role
    if (!newUser.role) {
      newErrors.role = "Please select a role";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handelnewUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, message } = await createUser(newUser);

      if (success) {
        alert("Signup successful! Redirecting to login...");
        navigate("/LoginPg"); // Redirect to login page
      } else {
        alert(`Signup failed: ${message}`);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
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
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your Username"
              required
              value={newUser.name}
              onChange={handleChange}
              autoComplete="username"
              className={errors.name ? "error-input" : ""}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@gmail.com"
              required
              value={newUser.email}
              onChange={handleChange}
              autoComplete="email"
              className={errors.email ? "error-input" : ""}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={newUser.password}
              onChange={handleChange}
              className={errors.password ? "error-input" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}

            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              value={newUser.role}
              onChange={handleChange}
              required
              className={errors.role ? "error-input" : ""}
            >
              <option value="">Select Role</option>
              <option value="Artist/Organizer">Artist/Organizer</option>
              <option value="Attendee">Attendee</option>
            </select>
            {errors.role && <p className="error-text">{errors.role}</p>}

            <div className="submitS">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
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
