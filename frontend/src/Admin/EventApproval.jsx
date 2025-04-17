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
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
} from "@mui/icons-material";

const EventApproval = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalEvents, setTotalEvents] = useState(0);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage, searchTerm, filterStatus]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          const mockData = generateMockEvents(filterStatus);
          resolve({
            data: mockData.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
            total: mockData.length,
          });
        }, 800);
      });

      setEvents(response.data);
      setTotalEvents(response.total);
    } catch (error) {
      console.error("Error fetching events:", error);
      setAlertMessage({
        type: "error",
        text: "Failed to load events. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo purposes
  const generateMockEvents = (status) => {
    const statuses = ["pending", "approved", "rejected"];
    const eventTypes = [
      "Conference",
      "Workshop",
      "Meetup",
      "Webinar",
      "Hackathon",
    ];
    const organizations = [
      "TechHub",
      "StartupGrind",
      "DevCommunity",
      "CodeCamp",
      "Innovation Labs",
    ];

    const mockEvents = [];
    for (let i = 1; i <= 75; i++) {
      const eventStatus = statuses[Math.floor(Math.random() * statuses.length)];
      if (status !== "all" && eventStatus !== status) continue;

      const eventName = `${
        eventTypes[Math.floor(Math.random() * eventTypes.length)]
      } #${i}`;
      if (
        searchTerm &&
        !eventName.toLowerCase().includes(searchTerm.toLowerCase())
      )
        continue;

      mockEvents.push({
        id: i,
        name: eventName,
        organizer:
          organizations[Math.floor(Math.random() * organizations.length)],
        date: new Date(
          Date.now() + (Math.random() * 50 - 10) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        location: ["Online", "New York", "San Francisco", "London", "Berlin"][
          Math.floor(Math.random() * 5)
        ],
        attendees: Math.floor(Math.random() * 500) + 50,
        status: eventStatus,
        createdAt: new Date(
          Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return mockEvents;
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filtering
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilterStatus(["pending", "approved", "rejected", "all"][newValue]);
  };

  // Open view dialog
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setViewDialogOpen(true);
  };

  // Handle approve/reject confirmation
  const handleOpenConfirmDialog = (event, type) => {
    setSelectedEvent(event);
    setActionType(type);
    setRejectReason("");
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
  };

  // Process the event approval/rejection
  const handleConfirmAction = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update the event status locally
      const updatedEvents = events.map((event) => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            status: actionType === "approve" ? "approved" : "rejected",
            rejectReason: actionType === "reject" ? rejectReason : null,
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      setAlertMessage({
        type: "success",
        text: `Event ${
          actionType === "approve" ? "approved" : "rejected"
        } successfully.`,
      });

      // Clear alert after 5 seconds
      setTimeout(() => setAlertMessage(null), 5000);
    } catch (error) {
      console.error(`Error ${actionType}ing event:`, error);
      setAlertMessage({
        type: "error",
        text: `Failed to ${actionType} event. Please try again.`,
      });
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case "pending":
        return <Chip label="Pending" color="warning" size="small" />;
      case "approved":
        return <Chip label="Approved" color="success" size="small" />;
      case "rejected":
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <EventIcon sx={{ mr: 1 }} />
        Event Approval Dashboard
      </Typography>

      {/* Alert messages */}
      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.text}
        </Alert>
      )}

      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by event name"
              variant="outlined"
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
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="pending">Pending Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for quick filtering */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="Rejected" />
        <Tab label="All Events" />
      </Tabs>

      {/* Events table */}
      <Paper>
        {loading && <LinearProgress />}

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="events table">
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Organizer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Attendees</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell component="th" scope="row">
                      {event.name}
                    </TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell align="right">{event.attendees}</TableCell>
                    <TableCell>{renderStatusChip(event.status)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewEvent(event)}
                      >
                        <ViewIcon />
                      </IconButton>

                      {event.status === "pending" && (
                        <>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() =>
                              handleOpenConfirmDialog(event, "approve")
                            }
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                              handleOpenConfirmDialog(event, "reject")
                            }
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {loading ? "Loading events..." : "No events found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalEvents}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* View Event Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              Event Details: {selectedEvent.name}
              <Typography variant="subtitle2" color="text.secondary">
                Created on: {new Date(selectedEvent.createdAt).toLocaleString()}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Basic Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Organizer:</strong> {selectedEvent.organizer}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong> {selectedEvent.date}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Location:</strong> {selectedEvent.location}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Expected Attendees:</strong>{" "}
                        {selectedEvent.attendees}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Status:</strong>{" "}
                        {renderStatusChip(selectedEvent.status)}
                      </Typography>
                      {selectedEvent.rejectReason && (
                        <Typography variant="body1" color="error">
                          <strong>Rejection Reason:</strong>{" "}
                          {selectedEvent.rejectReason}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Event Description
                      </Typography>
                      <Typography variant="body2">
                        {`This is a ${selectedEvent.name} being organized by ${selectedEvent.organizer}. 
                        It will take place in ${selectedEvent.location} on ${selectedEvent.date} with 
                        approximately ${selectedEvent.attendees} attendees expected.`}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2">
                        Additional details about the event would appear here.
                        This section would include information about the event
                        agenda, speakers, requirements, and other relevant
                        information provided by the organizer.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedEvent.status === "pending" && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => {
                      handleCloseViewDialog();
                      handleOpenConfirmDialog(selectedEvent, "approve");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => {
                      handleCloseViewDialog();
                      handleOpenConfirmDialog(selectedEvent, "reject");
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={handleCloseViewDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>
          {actionType === "approve"
            ? "Confirm Event Approval"
            : "Confirm Event Rejection"}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Typography variant="body1" gutterBottom>
                {actionType === "approve"
                  ? `Are you sure you want to approve "${selectedEvent.name}"?`
                  : `Are you sure you want to reject "${selectedEvent.name}"?`}
              </Typography>

              {actionType === "reject" && (
                <TextField
                  autoFocus
                  margin="dense"
                  label="Reason for rejection"
                  fullWidth
                  multiline
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            disabled={actionType === "reject" && !rejectReason.trim()}
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventApproval;
