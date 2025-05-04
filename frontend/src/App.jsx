import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import Home from "./pages/Home";
import LoginPg from "./pages/LoginPg";
import SignupPg from "./pages/SignupPg";
import Ticket from "./pages/Ticket";
import Artistbar from "./components/Artistbar";
import CreateEvent from "./Artist/CreateEvent";
import AdminBoard from "./Admin/AdminBoard";
import EventPage from "./pages/EventPage";
import Artist_Dashboard from "./Artist/Artist_Dashboard";
import Footer from "./components/Footer";
import SearchPage from "./pages/SearchPage";
import AttendeeApprova from "./Artist/AttendeeApprova";
import AttendeeProfile from "./pages/AttendeeProfile";
import OngoingEvent from "./Artist/OngoingEvent";
import EditEventPage from "./Artist/EditEventPage";
import ArtistEventPage from "./Artist/ArtistEventPage";
import BannedUsers from "./Admin/BannedUsers";
import UserManagement from "./Admin/UserManagement";
import EventApproval from "./Admin/EventApproval";
import Dashboard from "./Admin/Dashboard";

// Create a component to handle footer visibility
const FooterHandler = () => {
  const location = useLocation();
  const noFooterPaths = [
    "/LoginPg",
    "/SignupPg",
    "/AdminBoard",
    "/EventPage",
    "/SearchPage",
    "/AdminBoard",
    "/UserManagement",
    "/EventApproval",
    "/BannedUsers",
    "/Dashboard",
  ];

  return (
    !noFooterPaths.some((path) => location.pathname.startsWith(path)) && (
      <Footer />
    )
  );
};

const NavbarHandler = () => {
  const location = useLocation();
  const noNavbarPaths = [
    "/AdminBoard",
    "/UserManagement",
    "/EventApproval",
    "/BannedUsers",
    "/Dashboard",
  ];

  return (
    !noNavbarPaths.some((path) => location.pathname.startsWith(path)) && (
      <Navbar />
    )
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <NavbarHandler />{" "}
        <Routes>
          <Route path="/" element={<AboutUs />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/LoginPg" element={<LoginPg />} />
          <Route path="/SignupPg" element={<SignupPg />} />
          <Route path="/Ticket/" element={<Ticket />} />
          <Route path="/AdminBoard" element={<AdminBoard />} />
          <Route path="/Artistbar" element={<Artistbar />} />
          <Route path="/CreateEvent" element={<CreateEvent />} />
          <Route path="/EventPage/:eventId" element={<EventPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/Artist_Dashboard" element={<Artist_Dashboard />} />
          <Route path="/SearchPage" element={<SearchPage />} />
          <Route path="/AttendeeApprova" element={<AttendeeApprova />} />
          <Route path="/AttendeeProfile" element={<AttendeeProfile />} />
          <Route path="/OngoingEvent" element={<OngoingEvent />} />
          <Route
            path="/ArtistEventPage/:eventId"
            element={<ArtistEventPage />}
          />
          <Route path="/EditEventPage/:id" element={<EditEventPage />} />
          <Route path="/UserManagement" element={<UserManagement />} />
          <Route path="/EventApproval" element={<EventApproval />} />
          <Route path="/BannedUsers" element={<BannedUsers />} />
          <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
        <FooterHandler />
      </div>
    </Router>
  );
}

export default App;
