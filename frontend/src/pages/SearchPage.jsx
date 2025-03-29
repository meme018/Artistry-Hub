import React, { useState } from "react";
import EventCard from "../components/EventCard.jsx";
import "../styles/SearchPage.css";
import SearchIcon from "@mui/icons-material/Search";

const EventPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    console.log("Searching for:", searchValue, "in", locationValue);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="event-container">
      <div className="Search-container">
        <div className="searchNbtn">
          <div className="search-bar combined-search">
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="combined-input"
            />
            <div className="divider"></div>
            <input
              type="text"
              placeholder="City, Country"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="combined-input"
            />
            <SearchIcon
              onClick={handleSearch}
              className="search-icon"
              style={{ fontSize: 32 }}
            />
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="filters">
          <div className="filter-category">
            <h3>Category</h3>
            <label>
              <input type="checkbox" checked readOnly /> All
            </label>
            <label>
              <input type="checkbox" /> Sculpting
            </label>
            <label>
              <input type="checkbox" /> Digital Art
            </label>
            <label>
              <input type="checkbox" /> Painting
            </label>
            <label>
              <input type="checkbox" /> Calligraphy
            </label>
            <label>
              <input type="checkbox" /> Embroidery
            </label>
          </div>

          <div className="filter-category">
            <h3>Sub Category</h3>
            <label>
              <input type="checkbox" checked readOnly /> All
            </label>
            <label>
              <input type="checkbox" /> Showcase
            </label>
            <label>
              <input type="checkbox" /> Workshop
            </label>
            <label>
              <input type="checkbox" /> Meet up
            </label>
          </div>

          <div className="filter-category">
            <h3>Type</h3>
            <label>
              <input type="checkbox" checked readOnly /> All
            </label>
            <label>
              <input type="checkbox" /> Online
            </label>
            <label>
              <input type="checkbox" /> Offline-Indoors
            </label>
            <label>
              <input type="checkbox" /> Offline-Outdoors
            </label>
          </div>
        </div>

        <div className="event-list">
          {[1, 2, 3, 4].map((event, index) => (
            <EventCard key={index} />
          ))}
          <div className="no-more">No More</div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
