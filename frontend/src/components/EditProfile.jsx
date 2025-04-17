import React, { useState } from "react";
import "../styles/EditProfile.css";

const EditProfileModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate the form
      if (!formData.name.trim()) {
        setError("Username cannot be empty");
        setIsLoading(false);
        return;
      }

      // Call the onSave function passed from parent
      const result = await onSave(formData);

      if (!result.success) {
        setError(result.message);
      } else {
        onClose(); // Close modal on success
      }
    } catch (err) {
      setError("An error occurred while updating your profile.");
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal-overlay">
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose} type="button">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="edit-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Biography</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              className="edit-textarea"
              rows="4"
              disabled={isLoading}
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
