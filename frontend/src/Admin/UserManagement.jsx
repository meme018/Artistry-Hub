import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Ban,
  UserX,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "../store/user.js";
import "../styles/UserManagement.css";

function UserManagement() {
  const {
    token,
    getAllUsers,
    banUser,
    deleteUser,
    createUser,
    updateUserProfile,
    updateUserById,
  } = useUserStore();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [actionType, setActionType] = useState("");
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Attendee",
    bio: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch users");
      }

      setUsers(response.data);
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

  const showToast = (message, type = "success") => {
    const newToast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
    }, 3000);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUser = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Attendee",
      bio: "",
    });
    setShowAddEditModal(true);
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password for security
      role: user.role,
      bio: user.bio || "",
    });
    setShowAddEditModal(true);
  };

  const handleBanUser = (user) => {
    setCurrentUser(user);
    setActionType("ban");
    setBanReason("");
    setShowConfirmModal(true);
  };

  const handleDeleteUser = (user) => {
    setCurrentUser(user);
    setActionType("delete");
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    try {
      let response;

      if (actionType === "ban") {
        response = await banUser(currentUser._id, banReason);
        if (response.success) {
          showToast(`User ${currentUser.name} has been banned successfully`);
        }
      } else if (actionType === "delete") {
        response = await deleteUser(currentUser._id);
        if (response.success) {
          showToast(`User ${currentUser.name} has been deleted successfully`);
        }
      }

      if (!response.success) {
        throw new Error(response.message || `Failed to ${actionType} user`);
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (isEditing) {
        // Update existing user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }

        const currentUserRole = useUserStore.getState().currentUser?.role;
        const isCurrentUser =
          currentUser._id === useUserStore.getState().currentUser?.id;

        // Use the appropriate update function based on user role and whether updating self or other user
        if (currentUserRole === "Admin" && !isCurrentUser) {
          response = await updateUserById(currentUser._id, updateData);
        } else {
          response = await updateUserProfile({
            ...updateData,
            userId: currentUser._id,
          });
        }

        if (response.success) {
          showToast(`User ${formData.name} has been updated successfully`);
        }
      } else {
        // Add new user
        response = await createUser(formData);
        if (response.success) {
          showToast(`User ${formData.name} has been created successfully`);
        }
      }

      if (!response.success) {
        throw new Error(
          response.message ||
            `Failed to ${isEditing ? "update" : "create"} user`
        );
      }

      // Refresh users list
      fetchUsers();
      setShowAddEditModal(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const navigateTomain = () => {
    window.location.href = "/AdminBoard";
  };

  // Navigate to the banned users page
  const navigateToBannedUsers = () => {
    window.location.href = "/BannedUsers";
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      !user.isBanned && // Don't show banned users in this view
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-management-container">
      <div className="header">
        <div className="header-left">
          <button onClick={navigateTomain} className="back-button">
            <ArrowLeft className="icon" />
          </button>
          <h1 className="title">Back</h1>
        </div>
        <h1>User Management</h1>
        <div className="header-buttons">
          <button
            onClick={navigateToBannedUsers}
            className="view-banned-button"
          >
            <UserX className="icon" />
            View Banned Users
          </button>
          <button onClick={handleAddUser} className="add-user-button">
            <Plus className="icon" />
            Add User
          </button>
        </div>
      </div>

      <div className="user-panel">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${user.role
                          .toLowerCase()
                          .replace("/", "-")}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="edit-button"
                          title="Edit"
                          // disabled={user.role === "Admin"}
                        >
                          <Edit className="icon" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleBanUser(user)}
                          className="ban-button"
                          title="Ban"
                          // disabled={user.role === "Admin"}
                        >
                          <Ban className="icon" />
                          Ban
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="delete-button"
                          title="Delete"
                          // disabled={user.role === "Admin"}
                        >
                          <X className="icon" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="close-button"
              >
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {(!isEditing || formData.password) && (
                <div className="form-group">
                  <label htmlFor="password">
                    {isEditing
                      ? "New Password (leave blank to keep current)"
                      : "Password"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength="5"
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Artist/Organizer">Artist/Organizer</option>
                  <option value="Attendee">Attendee</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Save className="icon" />
                  {isEditing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h2>{actionType === "ban" ? "Ban User" : "Delete User"}</h2>
            <p>
              Are you sure you want to {actionType === "ban" ? "ban" : "delete"}{" "}
              user <span className="user-name">{currentUser?.name}</span>?
            </p>

            {actionType === "ban" && (
              <div className="form-group">
                <label htmlFor="banReason">Reason for ban (optional):</label>
                <textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows="3"
                  placeholder="Provide a reason for the ban"
                />
              </div>
            )}

            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={
                  actionType === "ban"
                    ? "confirm-ban-button"
                    : "confirm-delete-button"
                }
              >
                {actionType === "ban" ? "Ban User" : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-content">
              {toast.type === "success" ? (
                <span className="success-icon">✓</span>
              ) : (
                <span className="error-icon">!</span>
              )}
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

export default UserManagement;
