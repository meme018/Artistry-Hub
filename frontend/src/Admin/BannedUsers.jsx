import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  UserCheck,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { useUserStore } from "../store/user.js";
import "../styles/UserBan.css";

export default function BannedUsers() {
  const { token, getBannedUsers, unbanUser } = useUserStore();
  const [bannedUsers, setBannedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterOption, setFilterOption] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBannedUsers();
  }, [token]);

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      const response = await getBannedUsers();

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch banned users");
      }

      setBannedUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const handleUnbanUser = (user) => {
    setCurrentUser(user);
    setShowConfirmModal(true);
  };

  const confirmUnban = async () => {
    try {
      const response = await unbanUser(currentUser._id);

      if (!response.success) {
        throw new Error(response.message || "Failed to unban user");
      }

      // Remove user from banned list
      setBannedUsers(bannedUsers.filter((u) => u._id !== currentUser._id));
      setShowConfirmModal(false);

      // Show success toast
      showToast(`${currentUser.name} has been unbanned successfully`);
    } catch (err) {
      setError(err.message);
      setShowConfirmModal(false);
    }
  };

  const showToast = (message) => {
    const newToast = {
      id: Date.now(),
      message,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
    }, 3000);
  };

  const navigateToUserManagement = () => {
    window.location.href = "/UserManagement";
  };

  // Filter and search logic
  const filteredUsers = bannedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.banReason &&
        user.banReason.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterOption === "all") return matchesSearch;
    return matchesSearch && user.role === filterOption;
  });

  if (loading) return <div className="loading">Loading banned users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="banned-users-container">
      <div className="header">
        <div className="header-left">
          <button onClick={navigateToUserManagement} className="back-button">
            <ArrowLeft className="icon" />
          </button>
          <h1 className="title">Banned Users</h1>
        </div>
        <div className="status-badge">
          <AlertCircle className="icon" />
          <span>{bannedUsers.length} users currently banned</span>
        </div>
      </div>

      <div className="content-box">
        <div className="filters">
          <div className="search-container">
            <div className="search-icon"></div>
            <input
              type="text"
              placeholder="Search banned users..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-select">
            <select
              value={filterOption}
              onChange={handleFilterChange}
              className="filter-dropdown"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Artist/Organizer">Artist/Organizer</option>
              <option value="Attendee">Attendee</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Ban Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <span
                          className={`role-badge ${
                            user.role === "Admin"
                              ? "admin"
                              : user.role === "Artist/Organizer"
                              ? "artist"
                              : "attendee"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="ban-details">
                        <p>
                          Banned on:{" "}
                          <span className="detail-value">
                            {formatDate(user.bannedAt)}
                          </span>
                        </p>
                        {user.bannedBy && (
                          <p>
                            Banned by:{" "}
                            <span className="detail-value">
                              {typeof user.bannedBy === "object"
                                ? user.bannedBy.name
                                : user.bannedBy}
                            </span>
                          </p>
                        )}
                        <p>
                          User since:{" "}
                          <span className="detail-value">
                            {formatDate(user.createdAt)}
                          </span>
                        </p>
                        {user.banReason && (
                          <p>
                            Reason:{" "}
                            <span className="detail-value ban-reason">
                              {user.banReason}
                            </span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleUnbanUser(user)}
                        className="unban-button"
                      >
                        <UserCheck className="icon" />
                        Unban
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-results">
                    No banned users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Unban User</h2>
            <p className="modal-text">Are you sure you want to unban:</p>
            <div className="user-info">
              <p className="user-name">{currentUser?.name}</p>
              <p className="user-email">{currentUser?.email}</p>
              {currentUser?.banReason && (
                <p className="ban-reason">
                  Banned for:{" "}
                  <span className="reason-text">{currentUser.banReason}</span>
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button onClick={confirmUnban} className="confirm-button">
                <UserCheck className="icon" />
                Unban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <div className="toast-content">
              <Check className="icon" />
              <p>{toast.message}</p>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="toast-close"
            >
              <X className="icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
