import React, { useState, useEffect } from "react";
import "../styles/Search.css";
import SearchIcon from "@mui/icons-material/Search";

function Search() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    console.log("Searching for:", searchValue);

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
    <div className="home-container">
      {" "}
      {/* The search*/}
      <div className="Search-container">
        <div className="searchNbtn">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              name="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <SearchIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
