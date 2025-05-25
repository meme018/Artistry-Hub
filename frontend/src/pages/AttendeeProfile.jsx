import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AttendeeProfile.css";
import EditProfileModal from "../components/EditProfile.jsx";
import PersonIcon from "@mui/icons-material/Person";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EditIcon from "@mui/icons-material/Edit";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
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
  const handleLogout = async () => {
    try {
      const result = await logoutUser();

      // Add a small delay to ensure state is cleared
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate even if logout fails
      navigate("/", { replace: true });
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
    <div className="attendee-profile-container-centered">
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={currentUser}
          onSave={handleProfileUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Profile Card */}
      <div className="attendee-profile-card">
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
    </div>
  );
};

export default AttendeeProfile;
