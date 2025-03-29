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
import Filter from "./components/Filter";
import SearchPage from "./pages/SearchPage";
// Create a component to handle footer visibility
const FooterHandler = () => {
  const location = useLocation();
  const noFooterPaths = [
    "/LoginPg",
    "/SignupPg",
    "/AdminBoard",
    "/EventPage",
    "/SearchPage",
  ];

  return (
    !noFooterPaths.some((path) => location.pathname.startsWith(path)) && (
      <Footer />
    )
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<AboutUs />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/LoginPg" element={<LoginPg />} />
          <Route path="/SignupPg" element={<SignupPg />} />
          <Route path="/Ticket" element={<Ticket />} />
          <Route path="/AdminBoard" element={<AdminBoard />} />
          <Route path="/Artistbar" element={<Artistbar />} />
          <Route path="/CreateEvent" element={<CreateEvent />} />
          <Route path="/EventPage" element={<EventPage />} />
          <Route path="/Artist_Dashboard" element={<Artist_Dashboard />} />
          <Route path="/Filter" element={<Filter />} />
          <Route path="/SearchPage" element={<SearchPage />} />
        </Routes>
        <FooterHandler />
      </div>
    </Router>
  );
}

export default App;
