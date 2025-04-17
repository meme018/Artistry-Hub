import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AttendeeProfile.css";
import EditProfileModal from "../components/EditProfile.jsx";
import PersonIcon from "@mui/icons-material/Person";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EditIcon from "@mui/icons-material/Edit";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EventCard from "../components/EventCard.jsx";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useUserStore } from "../store/user.js";

const AttendeeProfile = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logoutUser, updateUserProfile } =
    useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/LoginPg");
    } else if (currentUser && currentUser.role !== "Attendee") {
      navigate("/Home");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Handle logout
  const handleLogout = () => {
    const result = logoutUser();
    if (result.success) {
      navigate("/");
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    console.log("Current auth state:", {
      isAuthenticated: useUserStore.getState().isAuthenticated,
      hasToken: !!useUserStore.getState().token,
      tokenValue: useUserStore.getState().token?.substring(0, 10) + "...", // Show part of token for debugging
    });

    try {
      const result = await updateUserProfile(updatedData);
      console.log("Profile update result:", result);

      if (result && result.success) {
        setIsEditModalOpen(false);
      } else {
        alert(result?.message || "Update failed");
      }

      return result || { success: false, message: "No result returned" };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "Error updating profile" };
    }
  };

  // If not authenticated or still loading
  if (!currentUser) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="attendee-profile-container">
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={currentUser}
          onSave={handleProfileUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {/* Left Sidebar */}
      <div className="attendee-profile-sidebar">
        <div className="attendee-profile-content">
          <div className="attendee-profile-avatar">
            <PersonIcon style={{ fontSize: 40, color: "#5D4E6D" }} />
          </div>
          <h3 className="attendee-profile-name">{currentUser.name}</h3>
          <p className="attendee-profile-email">{currentUser.email}</p>

          <div className="attendee-profile-bio-container">
            <h4 className="attendee-bio-title">Bio</h4>
            <p className="attendee-bio-text">
              {currentUser.bio || "No bio available"}
            </p>
          </div>

          <div className="attendee-profile-actions">
            <button
              className="attendee-action-button attendee-ticket-button"
              onClick={() => navigate("/Ticket")}
            >
              <ConfirmationNumberIcon
                style={{ fontSize: 16, marginRight: 5 }}
              />
              My Tickets
            </button>
            <button
              className="attendee-action-button attendee-edit-button"
              onClick={() => setIsEditModalOpen(true)}
            >
              <EditIcon style={{ fontSize: 16, marginRight: 5 }} />
              Edit Profile
            </button>
            <button
              className="attendee-action-button attendee-logout-button"
              onClick={handleLogout}
            >
              <ExitToAppIcon style={{ fontSize: 16, marginRight: 5 }} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Rest of component remains the same... */}
      <div className="attendee-main-content">
        <div className="attendee-events-section">
          <div className="attendee-section-header">
            <h2>Events</h2>
          </div>

          <div className="attendee-events-list">
            <EventCard
              title="Mastering the Art of Expression:"
              subtitle="A Journey Through Colors"
              date="Date and Time"
              location="Location"
              type="Offline-Indoor"
            />

            <div className="attendee-load-more">
              <span>Load more</span>
            </div>
          </div>
        </div>

        <div className="attendee-attended-section">
          <div className="attendee-section-header">
            <h2>Attended Event</h2>
          </div>

          <div className="attendee-container">
            <div className="attendee-event-card attendee-past-event">
              <div className="attendee-event-banner">
                <span>Event Banner</span>
                <div className="attendee-attended-badge">ATTENDED</div>
              </div>
              <div className="attendee-event-details">
                <div className="attendee-event-info">
                  <h3 className="attendee-event-title">
                    Mastering the Art of Expression:
                  </h3>
                  <p className="attendee-event-subtitle">
                    A Journey Through Colors
                  </p>
                  <div className="attendee-event-metadata">
                    <div className="attendee-metadata-item">
                      <CalendarMonthIcon
                        style={{ fontSize: 16, marginRight: 8 }}
                      />
                      <span>May 15, 2023 • 2:00 PM</span>
                    </div>
                    <div className="attendee-metadata-item">
                      <LocationOnIcon
                        style={{ fontSize: 16, marginRight: 8 }}
                      />
                      <span>Metropolitan Art Gallery</span>
                    </div>
                  </div>
                  <div className="attendee-event-type">
                    <span>Event type: </span>
                    <span className="attendee-type-value">Offline-Indoor</span>
                  </div>
                </div>
                <div className="attendee-event-footer">
                  <div className="attendee-event-ended">Event Ended</div>
                  <div className="attendee-event-rating">
                    Your rating: <span className="attendee-stars">★★★★☆</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="attendee-no-more">
            <p>No More</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeProfile;
