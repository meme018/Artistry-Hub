import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import Home from "./pages/Home";
import LoginPg from "./pages/LoginPg";
import SignupPg from "./pages/SignupPg";
import Ticket from "./pages/Ticket";
import Artistbar from "./components/Artistbar";
import CreateEvent from "./pages/CreateEvent";
import AdminBoard from "./Admin/AdminBoard";
import EventPage from "./pages/EventPage";
import Artist_Dashboard from "./pages/Artist_Dashboard";
import Footer from "./components/Footer";
import Filter from "./components/Filter";

function App() {
  return (
    <Router>
      {" "}
      {/* Ensure Router wraps everything */}
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
