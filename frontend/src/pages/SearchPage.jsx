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
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="event-container">
      {/* Search Section */}
      <div className="search-bar">
        <div className="combined-search">
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
            className={`search-icon ${isSearching ? "searching" : ""}`}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Filters Sidebar */}
        <div className="filters">
          <div className="filter-category">
            <h3>Category</h3>
            <label>
              <input type="checkbox" defaultChecked readOnly /> All
            </label>
            {[
              "Sculpting",
              "Digital Art",
              "Painting",
              "Calligraphy",
              "Embroidery",
            ].map((category) => (
              <label key={category}>
                <input type="checkbox" name="category" /> {category}
              </label>
            ))}
          </div>

          <div className="filter-category">
            <h3>Sub Category</h3>
            <label>
              <input type="checkbox" defaultChecked readOnly /> All
            </label>
            {["Showcase", "Workshop", "Meet up"].map((sub) => (
              <label key={sub}>
                <input type="checkbox" name="subcategory" /> {sub}
              </label>
            ))}
          </div>

          <div className="filter-category">
            <h3>Type</h3>
            <label>
              <input type="checkbox" defaultChecked readOnly /> All
            </label>
            {["Online", "Offline-Indoors", "Offline-Outdoors"].map((type) => (
              <label key={type}>
                <input type="checkbox" name="type" /> {type}
              </label>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="event-list">
          {[1, 2, 3, 4].map((index) => (
            <EventCard key={index} />
          ))}
          <div className="no-more">No More Events to Show</div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
