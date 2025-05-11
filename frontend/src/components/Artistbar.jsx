import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Face2Icon from "@mui/icons-material/Face2";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/Artistbar.css";
import EditProfileModal from "./EditProfile.jsx";
import { useUserStore } from "../store/user.js";

function Artistbar() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logoutUser, updateUserProfile } =
    useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirect if not authenticated or not an artist/organizer
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/LoginPg");
    } else if (currentUser && currentUser.role !== "Artist/Organizer") {
      navigate("/Home");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Handle logout
  const handleLogout = () => {
    const result = logoutUser();
    if (result.success) {
      navigate("/Home");
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
    <div className="artistbar">
      <div className="artistbar__profile">
        <h1 className="artistbar__title">Profile</h1>
        <div className="artistbar__profile-header">
          <Face2Icon className="artistbar__icon" />
          <h2 className="artistbar__name">{currentUser.name}</h2>
        </div>
        <div className="artistbar__bio">
          <h2 className="artistbar__subtitle">Bio</h2>
          <p className="artistbar__bio-text">
            {currentUser.bio || "No bio available"}
          </p>
        </div>
      </div>

      <Link to="/Artist_Dashboard" className="artistbar__link">
        Dashboard
      </Link>
      <Link to="/CreateEvent" className="artistbar__link">
        Create Event
      </Link>
      <Link to="/OngoingEvent" className="artistbar__link">
        Ongoing-event
      </Link>
      <Link
        to="#"
        className="artistbar__link"
        onClick={() => setIsEditModalOpen(true)}
      >
        Edit profile
      </Link>
      <Link
        to="#"
        className="artistbar__link artistbar__logout"
        onClick={handleLogout}
      >
        <LogoutIcon style={{ marginRight: "8px" }} />
        Logout
      </Link>

      {isEditModalOpen && (
        <EditProfileModal
          user={currentUser}
          onSave={handleProfileUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Artistbar;
