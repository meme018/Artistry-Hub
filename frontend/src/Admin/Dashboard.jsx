import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
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
    publishedEvents: 0,
    draftEvents: 0,
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
          publishedEvents: 75,
          draftEvents: 12,
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
              type: "event_published",
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
              type: "event_draft",
              event: "Poetry Reading",
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
    { name: "Published", value: stats.publishedEvents },
    { name: "Draft", value: stats.draftEvents },
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
      case "event_published":
        return (
          <span>
            Event <strong>{activity.event}</strong> was published
          </span>
        );
      case "event_draft":
        return (
          <span>
            Event <strong>{activity.event}</strong> saved as draft
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
    return <div className="linear-progress"></div>;
  }

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of Artistry Hub statistics and recent activity
        </p>
      </div>

      {/* Key Stats */}
      <div className="stats-card">
        <h2 className="stats-title">Total Users</h2>
        <div className="stats-value">{stats.totalUsers}</div>
        <p className="stats-details">
          {stats.activeUsers} active, {stats.bannedUsers} banned
        </p>
      </div>

      <div className="stats-card">
        <h2 className="stats-title">Total Events</h2>
        <div className="stats-value">{stats.totalEvents}</div>
        <p className="stats-details">
          {stats.publishedEvents} published, {stats.draftEvents} drafts
        </p>
      </div>

      <div className="stats-card">
        <h2 className="stats-title">User Engagement</h2>
        <div className="stats-value">
          {(stats.totalEvents / stats.activeUsers).toFixed(1)}
        </div>
        <p className="stats-details">Events per active user</p>
      </div>

      {/* Charts Section */}
      <div className="growth-chart-container">
        <h2 className="chart-title">Growth Over Time</h2>
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
      </div>

      <div className="side-charts-container">
        <div className="user-status-chart">
          <h2 className="chart-title">User Status</h2>
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
        </div>

        <div className="event-attendance-chart">
          <h2 className="chart-title">Event Attendance</h2>
          <div className="attendance-summary">
            <p>
              <strong>Total Events:</strong> {stats.totalEvents}
            </p>
            <p>
              <strong>Total Attendees:</strong> {stats.totalAttendees || 247}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart
              data={[
                { event: "Jazz Night", attendees: 42 },
                { event: "Art Workshop", attendees: 38 },
                { event: "Poetry Reading", attendees: 25 },
                { event: "Dance Class", attendees: 64 },
              ]}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="attendees" name="Attendees" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-container">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-list">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <span className="activity-description">
                  {renderActivityType(activity)}
                </span>
                <span className="activity-timestamp">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
