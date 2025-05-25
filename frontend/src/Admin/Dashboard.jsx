import React, { useState, useEffect } from "react";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Calendar,
  DollarSign,
  Ticket,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Gift,
} from "lucide-react";
import { useUserStore } from "../store/user.js";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    paidTickets: 0,
    freeTickets: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentActivity: [],
    monthlyData: [],
    revenueData: [],
  });

  // Get auth token and user from Zustand store
  const { token, currentUser, isAuthenticated } = useUserStore();

  // API base URL - adjust this to match your backend
  const API_BASE = "http://localhost:5000/api";

  // API call helper with auth from Zustand store
  const apiCall = async (endpoint, options = {}) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  };

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated || !currentUser || currentUser.role !== "Admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [
          usersResponse,
          bannedUsersResponse,
          eventsResponse,
          ticketsResponse,
        ] = await Promise.all([
          apiCall("/users"), // Endpoint to fetch ALL users
          apiCall("/users/banned"), // Endpoint for banned users
          apiCall("/events"), // Endpoint for ALL events
          apiCall("/tickets/alltickets"), // Endpoint for ALL tickets
        ]);

        // Extract data from responses (assuming your API returns { data: [...] })
        const usersData = usersResponse.data || usersResponse;
        const bannedUsersData = bannedUsersResponse.data || bannedUsersResponse;
        const eventsData = eventsResponse.data || eventsResponse;
        const ticketsData = ticketsResponse.data || ticketsResponse;

        // Process user data
        const totalUsers = usersData.length || 0;
        const bannedUsers = bannedUsersData.length || 0;
        const activeUsers = totalUsers - bannedUsers;

        // Process event data
        const totalEvents = eventsData.length || 0;
        const publishedEvents = eventsData.filter(
          (event) => event.status === "published" || event.status === "active"
        ).length;

        // Process ticket data
        const totalTickets = ticketsData.length || 0;
        const approvedTickets = ticketsData.filter(
          (ticket) => ticket.approvalStatus === "approved"
        ).length;
        const pendingTickets = ticketsData.filter(
          (ticket) => ticket.approvalStatus === "pending"
        ).length;
        const rejectedTickets = ticketsData.filter(
          (ticket) => ticket.approvalStatus === "rejected"
        ).length;

        // Separate paid and free tickets
        const paidTickets = ticketsData.filter(
          (ticket) => ticket.paymentId && ticket.approvalStatus === "approved"
        ).length;
        const freeTickets = ticketsData.filter(
          (ticket) => !ticket.paymentId && ticket.approvalStatus === "approved"
        ).length;

        // Calculate revenue from PAID tickets only
        const totalRevenue = calculateTotalRevenue(eventsData, ticketsData);
        const monthlyRevenue = calculateMonthlyRevenue(eventsData, ticketsData);

        // Generate monthly data for charts (last 5 months)
        const monthlyData = generateMonthlyData(
          usersData,
          eventsData,
          ticketsData
        );
        const revenueData = generateRevenueData(eventsData, ticketsData);

        // Generate recent activity
        const recentActivity = generateRecentActivity(
          usersData,
          eventsData,
          ticketsData
        );

        setStats({
          totalUsers,
          activeUsers,
          bannedUsers,
          totalEvents,
          publishedEvents,
          totalTickets,
          paidTickets,
          freeTickets,
          approvedTickets,
          pendingTickets,
          rejectedTickets,
          totalRevenue,
          monthlyRevenue,
          recentActivity,
          monthlyData,
          revenueData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);

        // Fallback to mock data if API fails
        setStats({
          totalUsers: 245,
          activeUsers: 198,
          bannedUsers: 12,
          totalEvents: 156,
          publishedEvents: 134,
          totalTickets: 892,
          paidTickets: 634,
          freeTickets: 258,
          approvedTickets: 745,
          pendingTickets: 67,
          rejectedTickets: 80,
          totalRevenue: 45670,
          monthlyRevenue: 12450,
          recentActivity: [
            {
              id: 1,
              type: "user_registration",
              user: "Sarah Johnson",
              timestamp: "2025-05-24T14:30:00Z",
            },
            {
              id: 2,
              type: "event_created",
              event: "Digital Art Exhibition",
              user: "Michael Chen",
              timestamp: "2025-05-24T13:15:00Z",
            },
            {
              id: 3,
              type: "ticket_approved",
              user: "Emma Wilson",
              event: "Photography Workshop",
              timestamp: "2025-05-24T11:20:00Z",
            },
          ],
          monthlyData: [
            {
              name: "Jan",
              users: 45,
              events: 28,
              revenue: 8500,
              tickets: 156,
              paidTickets: 89,
              freeTickets: 67,
            },
            {
              name: "Feb",
              users: 62,
              events: 35,
              revenue: 12300,
              tickets: 203,
              paidTickets: 142,
              freeTickets: 61,
            },
            {
              name: "Mar",
              users: 78,
              events: 42,
              revenue: 15600,
              tickets: 267,
              paidTickets: 178,
              freeTickets: 89,
            },
            {
              name: "Apr",
              users: 94,
              events: 51,
              revenue: 18900,
              tickets: 334,
              paidTickets: 223,
              freeTickets: 111,
            },
            {
              name: "May",
              users: 115,
              events: 67,
              revenue: 22400,
              tickets: 421,
              paidTickets: 287,
              freeTickets: 134,
            },
          ],
          revenueData: [
            { name: "Jan", revenue: 8500 },
            { name: "Feb", revenue: 12300 },
            { name: "Mar", revenue: 15600 },
            { name: "Apr", revenue: 18900 },
            { name: "May", revenue: 22400 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, isAuthenticated, currentUser]);

  // Calculate total revenue from paid tickets only
  const calculateTotalRevenue = (events, tickets) => {
    return events.reduce((sum, event) => {
      // Find paid tickets for this event that are approved
      const eventPaidTickets = tickets.filter(
        (ticket) =>
          ticket.event === event._id &&
          ticket.approvalStatus === "approved" &&
          ticket.paymentId // Only count tickets with payment
      );

      // Use event.Price or event.ticketPrice (adjust based on your schema)
      const ticketPrice = event.Price || event.ticketPrice || 0;
      return sum + eventPaidTickets.length * ticketPrice;
    }, 0);
  };

  // Calculate monthly revenue from paid tickets only
  const calculateMonthlyRevenue = (events, tickets) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return events.reduce((sum, event) => {
      const eventDate = new Date(event.createdAt);
      if (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      ) {
        // Find paid tickets for this event that are approved
        const eventPaidTickets = tickets.filter(
          (ticket) =>
            ticket.event === event._id &&
            ticket.approvalStatus === "approved" &&
            ticket.paymentId // Only count tickets with payment
        );

        const ticketPrice = event.Price || event.ticketPrice || 0;
        return sum + eventPaidTickets.length * ticketPrice;
      }
      return sum;
    }, 0);
  };

  // Helper function to generate monthly data
  const generateMonthlyData = (users, events, tickets) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = [];
    const currentDate = new Date();

    for (let i = 4; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = months[date.getMonth()];

      const monthUsers = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return (
          userDate.getMonth() === date.getMonth() &&
          userDate.getFullYear() === date.getFullYear()
        );
      }).length;

      const monthEvents = events.filter((event) => {
        const eventDate = new Date(event.createdAt);
        return (
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      }).length;

      const monthTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.createdAt);
        return (
          ticketDate.getMonth() === date.getMonth() &&
          ticketDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Count paid and free tickets for this month
      const monthPaidTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.createdAt);
        return (
          ticketDate.getMonth() === date.getMonth() &&
          ticketDate.getFullYear() === date.getFullYear() &&
          ticket.paymentId &&
          ticket.approvalStatus === "approved"
        );
      }).length;

      const monthFreeTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.createdAt);
        return (
          ticketDate.getMonth() === date.getMonth() &&
          ticketDate.getFullYear() === date.getFullYear() &&
          !ticket.paymentId &&
          ticket.approvalStatus === "approved"
        );
      }).length;

      // Calculate revenue for this month (paid tickets only)
      const monthRevenue = events.reduce((sum, event) => {
        const eventDate = new Date(event.createdAt);
        if (
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        ) {
          const eventPaidTickets = tickets.filter(
            (ticket) =>
              ticket.event === event._id &&
              ticket.approvalStatus === "approved" &&
              ticket.paymentId
          );
          const ticketPrice = event.Price || event.ticketPrice || 0;
          return sum + eventPaidTickets.length * ticketPrice;
        }
        return sum;
      }, 0);

      data.push({
        name: monthName,
        users: monthUsers,
        events: monthEvents,
        tickets: monthTickets,
        paidTickets: monthPaidTickets,
        freeTickets: monthFreeTickets,
        revenue: monthRevenue,
      });
    }

    return data;
  };

  // Helper function to generate revenue data
  const generateRevenueData = (events, tickets) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = [];
    const currentDate = new Date();

    for (let i = 4; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = months[date.getMonth()];

      const monthRevenue = events.reduce((sum, event) => {
        const eventDate = new Date(event.createdAt);
        if (
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        ) {
          const eventPaidTickets = tickets.filter(
            (ticket) =>
              ticket.event === event._id &&
              ticket.approvalStatus === "approved" &&
              ticket.paymentId // Only paid tickets
          );
          const ticketPrice = event.Price || event.ticketPrice || 0;
          return sum + eventPaidTickets.length * ticketPrice;
        }
        return sum;
      }, 0);

      data.push({
        name: monthName,
        revenue: monthRevenue,
      });
    }

    return data;
  };

  // Helper function to generate recent activity
  const generateRecentActivity = (users, events, tickets) => {
    const activities = [];

    // Recent user registrations
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);

    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user._id}`,
        type: "user_registration",
        user: user.fullName || user.name || user.username,
        timestamp: user.createdAt,
      });
    });

    // Recent events
    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);

    recentEvents.forEach((event) => {
      activities.push({
        id: `event-${event._id}`,
        type:
          event.status === "published" ? "event_published" : "event_created",
        event: event.title,
        user: event.organizerName || "Unknown",
        timestamp: event.createdAt,
      });
    });

    // Recent ticket approvals (both paid and free)
    const recentTickets = tickets
      .filter((ticket) => ticket.approvalStatus === "approved")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 2);

    recentTickets.forEach((ticket) => {
      const event = events.find((e) => e._id === ticket.event);
      activities.push({
        id: `ticket-${ticket._id}`,
        type: ticket.paymentId ? "paid_ticket_approved" : "ticket_approved",
        user: ticket.userName || "Unknown",
        event: event?.title || "Unknown Event",
        timestamp: ticket.updatedAt,
        isPaid: !!ticket.paymentId,
      });
    });

    return activities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Chart data for ticket types
  const ticketTypeData = [
    { name: "Paid Tickets", value: stats.paidTickets, color: "#06D6A0" },
    { name: "Free Tickets", value: stats.freeTickets, color: "#8B5CF6" },
  ];

  const ticketStatusData = [
    { name: "Approved", value: stats.approvedTickets, color: "#06D6A0" },
    { name: "Pending", value: stats.pendingTickets, color: "#FFD166" },
    { name: "Rejected", value: stats.rejectedTickets, color: "#EF476F" },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render activity type
  const renderActivityType = (activity) => {
    const activityIcons = {
      user_registration: (
        <Users className="activity-icon activity-icon--blue" />
      ),
      event_created: (
        <Calendar className="activity-icon activity-icon--purple" />
      ),
      ticket_approved: (
        <CheckCircle className="activity-icon activity-icon--green" />
      ),
      paid_ticket_approved: (
        <CreditCard className="activity-icon activity-icon--green" />
      ),
      event_published: (
        <Activity className="activity-icon activity-icon--indigo" />
      ),
    };

    const activityText = {
      user_registration: (
        <span>
          <strong>{activity.user}</strong> registered
        </span>
      ),
      event_created: (
        <span>
          <strong>{activity.user}</strong> created{" "}
          <strong>{activity.event}</strong>
        </span>
      ),
      ticket_approved: (
        <span>
          <strong>{activity.user}</strong>'s free ticket for{" "}
          <strong>{activity.event}</strong> approved
        </span>
      ),
      paid_ticket_approved: (
        <span>
          <strong>{activity.user}</strong>'s paid ticket for{" "}
          <strong>{activity.event}</strong> approved
        </span>
      ),
      event_published: (
        <span>
          Event <strong>{activity.event}</strong> was published
        </span>
      ),
    };

    return (
      <div className="activity-type">
        {activityIcons[activity.type]}
        {activityText[activity.type] || <span>{activity.type}</span>}
      </div>
    );
  };

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !currentUser || currentUser.role !== "Admin") {
    return (
      <div className="dashboard-container">
        <div className="error-banner error-banner--red">
          <div className="error-banner__header">
            <AlertCircle className="error-banner__icon" />
            <span className="error-banner__title">Access Denied</span>
          </div>
          <p className="error-banner__message">
            You need admin privileges to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot loading-dot--delay-1"></div>
          <div className="loading-dot loading-dot--delay-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-banner error-banner--red">
          <div className="error-banner__header">
            <AlertCircle className="error-banner__icon" />
            <span className="error-banner__title">
              Error loading dashboard data
            </span>
          </div>
          <p className="error-banner__message">{error}</p>
          <p className="error-banner__fallback">
            Showing fallback data instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of Artistry Hub statistics and recent activity
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="stats-grid">
        {/* Total Users */}
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__text">
              <p className="stat-card__label">Total Users</p>
              <p className="stat-card__value">{stats.totalUsers}</p>
              <p className="stat-card__details">{stats.activeUsers} active</p>
            </div>
            <div className="stat-card__icon stat-card__icon--blue">
              <Users className="icon" />
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__text">
              <p className="stat-card__label">Total Events</p>
              <p className="stat-card__value">{stats.totalEvents}</p>
              <p className="stat-card__details">{stats.totalEvents}published</p>
            </div>
            <div className="stat-card__icon stat-card__icon--purple">
              <Calendar className="icon" />
            </div>
          </div>
        </div>

        {/* Total Tickets with breakdown */}
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__text">
              <p className="stat-card__label">Ticket Taken</p>
              <p className="stat-card__value">{stats.totalTickets}</p>
              <p className="stat-card__details">
                {stats.paidTickets} paid • {stats.freeTickets} free
              </p>
            </div>
            <div className="stat-card__icon stat-card__icon--green">
              <Ticket className="icon" />
            </div>
          </div>
        </div>

        {/* Total Revenue (from paid tickets only) */}
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__text">
              <p className="stat-card__label">Total Revenue</p>
              <p className="stat-card__value">NRP 1499</p>
            </div>
            <div className="stat-card__icon stat-card__icon--yellow">
              <DollarSign className="icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Growth Over Time */}
        <div className="chart-card">
          <h2 className="chart-title">Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="users"
                name="Users"
                fill="#8B5CF6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="events"
                name="Events"
                fill="#06D6A0"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="paidTickets"
                name="Paid Tickets"
                fill="#FFD166"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="freeTickets"
                name="Free Tickets"
                fill="#EF476F"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Type Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Ticket Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Status Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Ticket Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ticketStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity</h2>
          <Activity className="activity-header-icon" />
        </div>

        <div className="activity-list">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  {renderActivityType(activity)}
                </div>
                <div className="activity-timestamp">
                  <Clock className="timestamp-icon" />
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <p className="activity-empty">No recent activity to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
