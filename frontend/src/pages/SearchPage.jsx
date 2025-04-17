import React, { useState, useEffect } from "react";
import EventCard from "../components/EventCard.jsx";
import "../styles/SearchPage.css";
import SearchIcon from "@mui/icons-material/Search";
import { useEventStore } from "../store/event";

const SearchPage = () => {
  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Get events and functions from the store
  const { events, fetchEvents, isLoading, error, filterEvents } =
    useEventStore();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchError, setSearchError] = useState(null);

  // Fetch all events when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events based on search and filters
  useEffect(() => {
    if (events.length > 0) {
      setIsSearching(true);
      setSearchError(null);

      try {
        const criteria = {
          searchTerm: searchTerm,
          locationTerm: locationTerm,
          category: selectedCategory,
          subCategory: selectedSubCategory,
          type: selectedType,
        };

        const filtered = filterEvents(criteria);
        setFilteredEvents(filtered);
      } catch (err) {
        setSearchError("Error filtering events. Please try again.");
        console.error("Filtering error:", err);
      } finally {
        setIsSearching(false);
      }
    }
  }, [
    events,
    searchTerm,
    locationTerm,
    selectedCategory,
    selectedSubCategory,
    selectedType,
    filterEvents,
  ]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedType("");
    setSearchTerm("");
    setLocationTerm("");
    setSearchError(null);
  };

  if (isLoading)
    return <div className="loading-container">Loading events...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="event-container">
      {/* Search Section */}
      <div className="search-bar">
        <div className="combined-search">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="combined-input"
          />
          <div className="divider"></div>
          <input
            type="text"
            placeholder="City, Country"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="combined-input"
          />
          <SearchIcon
            onClick={handleSearch}
            className={`search-icon ${isSearching ? "searching" : ""}`}
          />
        </div>
        {searchError && <div className="search-error">{searchError}</div>}
      </div>

      {/* Main Content */}
      <div className="content-wrapper-Search">
        {/* Filters Sidebar */}
        <div className="filters">
          <div className="filter-category">
            <h3>Category</h3>
            <label>
              <input
                type="checkbox"
                checked={selectedCategory === ""}
                onChange={() => setSelectedCategory("")}
              />{" "}
              All
            </label>
            {[
              "Sculpting",
              "Digital Art",
              "Painting",
              "Calligraphy",
              "Embroidery",
            ].map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                />{" "}
                {category}
              </label>
            ))}
          </div>

          <div className="filter-category">
            <h3>Sub Category</h3>
            <label>
              <input
                type="checkbox"
                checked={selectedSubCategory === ""}
                onChange={() => setSelectedSubCategory("")}
              />{" "}
              All
            </label>
            {["Showcase", "Workshop", "Meet up"].map((sub) => (
              <label key={sub}>
                <input
                  type="checkbox"
                  checked={selectedSubCategory === sub}
                  onChange={() => setSelectedSubCategory(sub)}
                />{" "}
                {sub}
              </label>
            ))}
          </div>

          <div className="filter-category">
            <h3>Type</h3>
            <label>
              <input
                type="checkbox"
                checked={selectedType === ""}
                onChange={() => setSelectedType("")}
              />{" "}
              All
            </label>
            {["Online", "Offline-indoors", "Offline-outdoors"].map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                />{" "}
                {type}
              </label>
            ))}
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>

        {/* Event List */}
        <div className="event-list">
          {isSearching ? (
            <div className="searching-message">Searching...</div>
          ) : filteredEvents.length > 0 ? (
            <>
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
              <div className="no-more">No More Events to Show</div>
            </>
          ) : (
            <div className="no-events-message">
              <p>No events found matching your criteria.</p>
              <p>Try different search terms or clear filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
