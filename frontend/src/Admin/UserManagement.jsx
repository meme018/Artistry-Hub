import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Block as BanIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // This would be replaced with an actual API call
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

        const mockUsers = [
          {
            id: "1",
            name: "John Smith",
            email: "john@example.com",
            status: "active",
            createdAt: "2025-03-15",
            eventsCreated: 5,
            profileImage: null,
          },
          {
            id: "2",
            name: "Sara Wilson",
            email: "sara@example.com",
            status: "active",
            createdAt: "2025-03-12",
            eventsCreated: 3,
            profileImage: null,
          },
          {
            id: "3",
            name: "Michael Brown",
            email: "michael@example.com",
            status: "active",
            createdAt: "2025-02-28",
            eventsCreated: 7,
            profileImage: null,
          },
          {
            id: "4",
            name: "Emma Johnson",
            email: "emma@example.com",
            status: "active",
            createdAt: "2025-03-01",
            eventsCreated: 8,
            profileImage: null,
          },
          {
            id: "5",
            name: "David Lee",
            email: "david@example.com",
            status: "active",
            createdAt: "2025-03-10",
            eventsCreated: 2,
            profileImage: null,
          },
          {
            id: "6",
            name: "Olivia Martinez",
            email: "olivia@example.com",
            status: "active",
            createdAt: "2025-03-18",
            eventsCreated: 1,
            profileImage: null,
          },
          {
            id: "7",
            name: "James Wilson",
            email: "james@example.com",
            status: "active",
            createdAt: "2025-03-20",
            eventsCreated: 4,
            profileImage: null,
          },
          {
            id: "8",
            name: "Sophia Taylor",
            email: "sophia@example.com",
            status: "active",
            createdAt: "2025-03-25",
            eventsCreated: 0,
            profileImage: null,
          },
          {
            id: "9",
            name: "William Davis",
            email: "william@example.com",
            status: "active",
            createdAt: "2025-03-27",
            eventsCreated: 2,
            profileImage: null,
          },
          {
            id: "10",
            name: "Isabella Brown",
            email: "isabella@example.com",
            status: "active",
            createdAt: "2025-03-30",
            eventsCreated: 6,
            profileImage: null,
          },
          {
            id: "11",
            name: "Ethan Miller",
            email: "ethan@example.com",
            status: "active",
            createdAt: "2025-04-01",
            eventsCreated: 1,
            profileImage: null,
          },
          {
            id: "12",
            name: "Mia Johnson",
            email: "mia@example.com",
            status: "active",
            createdAt: "2025-04-02",
            eventsCreated: 0,
            profileImage: null,
          },
        ];

        // Filter by search term if provided
        const filteredUsers = searchTerm
          ? mockUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : mockUsers;

        setUsers(filteredUsers);
        setTotalUsers(filteredUsers.length);
      } catch (error) {
        console.error("Error fetching users:", error);
        setAlert({
          show: true,
          message: "Failed to load users. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Open ban dialog
  const handleOpenBanDialog = (user) => {
    setSelectedUser(user);
    setBanReason("");
    setBanDialogOpen(true);
  };

  // Close ban dialog
  const handleCloseBanDialog = () => {
    setBanDialogOpen(false);
    setSelectedUser(null);
  };

  // Handle ban user
  const handleBanUser = async () => {
    try {
      // This would be replaced with an actual API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      // Update local state (in a real app, this would be done after successful API call)
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, status: "banned" } : user
      );

      setUsers(updatedUsers);

      setAlert({
        show: true,
        message: `${selectedUser.name} has been banned successfully.`,
        severity: "success",
      });

      // Close the dialog
      handleCloseBanDialog();

      // Hide alert after 5 seconds
      setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
    } catch (error) {
      console.error("Error banning user:", error);
      setAlert({
        show: true,
        message: "Failed to ban user. Please try again.",
        severity: "error",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar based on user id
  const getAvatarColor = (id) => {
    const colors = [
      "#1976d2",
      "#388e3c",
      "#d32f2f",
      "#7b1fa2",
      "#c2185b",
      "#0097a7",
      "#fbc02d",
      "#455a64",
    ];
    const index = parseInt(id, 16) % colors.length;
    return colors[Math.abs(index)];
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        View and manage all active users in the system. Banned users can be
        viewed in the Banned Users section.
      </Typography>

      {/* Alert message */}
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Users table */}
      <Paper elevation={2}>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell>Events Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: getAvatarColor(user.id),
                                mr: 2,
                              }}
                            >
                              {getUserInitials(user.name)}
                            </Avatar>
                            <Typography variant="body1">{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${user.eventsCreated} events`}
                            size="small"
                            color={
                              user.eventsCreated > 0 ? "primary" : "default"
                            }
                            variant={
                              user.eventsCreated > 0 ? "filled" : "outlined"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View User Details">
                            <IconButton size="small">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ban User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenBanDialog(user)}
                            >
                              <BanIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Options">
                            <IconButton size="small">
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalUsers}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Link to banned users */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<BanIcon />}
          component={Link}
          to="/banned-users"
        >
          View Banned Users
        </Button>
      </Box>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onClose={handleCloseBanDialog}>
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to ban {selectedUser?.name}? This user will be
            unable to login or perform any actions in the system until unbanned.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Ban"
            fullWidth
            multiline
            rows={3}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBanDialog}>Cancel</Button>
          <Button
            onClick={handleBanUser}
            color="error"
            disabled={!banReason.trim()}
          >
            Ban User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
