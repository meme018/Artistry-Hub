import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    recentActivity: [],
  });

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // This would be replaced with an actual API call
        // Mock data for demonstration
        const mockData = {
          totalUsers: 120,
          activeUsers: 105,
          bannedUsers: 15,
          totalEvents: 87,
          pendingEvents: 12,
          approvedEvents: 68,
          rejectedEvents: 7,
          recentActivity: [
            {
              id: 1,
              type: "user_registration",
              user: "Alex Johnson",
              timestamp: "2025-04-02T14:30:00Z",
            },
            {
              id: 2,
              type: "event_created",
              event: "Jazz Night",
              user: "Maria Garcia",
              timestamp: "2025-04-02T13:15:00Z",
            },
            {
              id: 3,
              type: "event_approved",
              event: "Art Workshop",
              timestamp: "2025-04-02T11:45:00Z",
            },
            {
              id: 4,
              type: "user_banned",
              user: "Tom Wilson",
              timestamp: "2025-04-01T22:10:00Z",
            },
            {
              id: 5,
              type: "event_rejected",
              event: "Improper Content Event",
              timestamp: "2025-04-01T20:30:00Z",
            },
          ],
        };

        setStats(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for charts
  const userStatusData = [
    { name: "Active", value: stats.activeUsers },
    { name: "Banned", value: stats.bannedUsers },
  ];

  const eventStatusData = [
    { name: "Pending", value: stats.pendingEvents },
    { name: "Approved", value: stats.approvedEvents },
    { name: "Rejected", value: stats.rejectedEvents },
  ];

  const monthlyData = [
    { name: "Jan", users: 65, events: 40 },
    { name: "Feb", users: 75, events: 45 },
    { name: "Mar", users: 90, events: 55 },
    { name: "Apr", users: 120, events: 87 },
  ];

  // Format timestamp for recent activity
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render activity type with appropriate text
  const renderActivityType = (activity) => {
    switch (activity.type) {
      case "user_registration":
        return (
          <span>
            <strong>{activity.user}</strong> registered
          </span>
        );
      case "event_created":
        return (
          <span>
            <strong>{activity.user}</strong> created event{" "}
            <strong>{activity.event}</strong>
          </span>
        );
      case "event_approved":
        return (
          <span>
            Event <strong>{activity.event}</strong> was approved
          </span>
        );
      case "event_rejected":
        return (
          <span>
            Event <strong>{activity.event}</strong> was rejected
          </span>
        );
      case "user_banned":
        return (
          <span>
            User <strong>{activity.user}</strong> was banned
          </span>
        );
      default:
        return <span>{activity.type}</span>;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Overview of Artistry Hub statistics and recent activity
        </Typography>
      </Grid>

      {/* Key Stats */}
      <Grid item xs={12} md={3}>
        <Paper
          elevation={2}
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Users
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {stats.totalUsers}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.activeUsers} active, {stats.bannedUsers} banned
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper
          elevation={2}
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Events
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {stats.totalEvents}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.pendingEvents} pending approval
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper
          elevation={2}
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Approval Rate
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {Math.round(
              (stats.approvedEvents /
                (stats.approvedEvents + stats.rejectedEvents)) *
                100
            )}
            %
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {stats.approvedEvents} approved, {stats.rejectedEvents} rejected
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper
          elevation={2}
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            User Engagement
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {(stats.totalEvents / stats.activeUsers).toFixed(1)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Events per active user
          </Typography>
        </Paper>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Growth Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" name="Users" fill="#8884d8" />
              <Bar dataKey="events" name="Events" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
          <Box sx={{ height: "50%" }}>
            <Typography variant="h6" gutterBottom>
              User Status
            </Typography>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {userStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ height: "50%", mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Event Status
            </Typography>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Recent Activity" />
          <CardContent>
            {stats.recentActivity.map((activity) => (
              <Box
                key={activity.id}
                sx={{ py: 1, borderBottom: "1px solid #eee" }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{renderActivityType(activity)}</span>
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
