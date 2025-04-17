import React, { useState, useEffect } from "react";
import "../styles/UserBan.css";

const BannedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          const mockData = generateMockUsers();
          resolve({
            data: mockData.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
            total: mockData.length,
          });
        }, 600);
      });

      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("error", "Failed to load banned users.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsers = () => {
    const mockUsers = [];
    const reasons = ["Inappropriate content", "Spam", "Terms violation"];

    for (let i = 1; i <= 50; i++) {
      const username = `user${i}`;
      const fullName = `User ${i}`;

      if (
        searchTerm &&
        !fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !username.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        continue;
      }

      mockUsers.push({
        id: i,
        username,
        fullName,
        email: `${username}@example.com`,
        bannedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        attempts: Math.floor(Math.random() * 5),
      });
    }

    return mockUsers;
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleUnbanConfirm = (user) => {
    setSelectedUser(user);
    setConfirmDialogOpen(true);
  };

  const handleUnbanUser = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      setTotalUsers((prev) => prev - 1);
      showAlert("success", `User ${selectedUser.username} has been unbanned.`);
    } catch (error) {
      showAlert("error", "Failed to unban user.");
    } finally {
      setConfirmDialogOpen(false);
      setViewDialogOpen(false);
    }
  };

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 5000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="banned-users-container">
      <header className="page-header">
        <div className="header-icon">🚫</div>
        <h1>Banned Users</h1>
      </header>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="search-container">
        <div className="search-icon">🔍</div>
        <input
          type="text"
          placeholder="Search by username or name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Banned Date</th>
                  <th>Reason</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.bannedAt)}</td>
                      <td>{user.reason}</td>
                      <td className="actions-column">
                        <button
                          className="icon-button info"
                          onClick={() => handleViewUser(user)}
                          title="View Details"
                        >
                          ℹ️
                        </button>
                        <button
                          className="icon-button success"
                          onClick={() => handleUnbanConfirm(user)}
                          title="Unban User"
                        >
                          ✓
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-message">
                      No banned users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                Showing {page * rowsPerPage + 1} to{" "}
                {Math.min((page + 1) * rowsPerPage, totalUsers)} of {totalUsers}{" "}
                entries
              </div>
              <div className="pagination-controls">
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="rows-select"
                >
                  <option value="5">5 rows</option>
                  <option value="10">10 rows</option>
                  <option value="25">25 rows</option>
                </select>
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className="pagination-button"
                >
                  prev
                </button>
                <span className="page-number">{page + 1}</span>
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={(page + 1) * rowsPerPage >= totalUsers}
                  className="pagination-button"
                >
                  Next
                </button>
                ``
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Dialog */}
      {viewDialogOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>User Details: {selectedUser.username}</h2>
              <button
                className="close-button"
                onClick={() => setViewDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <p>
                  <strong>Full Name:</strong> {selectedUser.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Banned On:</strong>{" "}
                  {formatDate(selectedUser.bannedAt)}
                </p>
                <p>
                  <strong>Reason:</strong> {selectedUser.reason}
                </p>
                <p>
                  <strong>Login Attempts Since Ban:</strong>{" "}
                  {selectedUser.attempts}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="button success-button"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleUnbanConfirm(selectedUser);
                }}
              >
                Unban User
              </button>
              <button
                className="button secondary-button"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Unban Dialog */}
      {confirmDialogOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h2>Confirm User Unban</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to unban{" "}
                <strong>{selectedUser.username}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="button secondary-button"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button success-button"
                onClick={handleUnbanUser}
              >
                Unban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannedUsers;
