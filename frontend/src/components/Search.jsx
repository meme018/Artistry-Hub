import React, { useState } from "react";
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
    <div className="search-component">
      <div className="search-component__container">
        <div className="search-component__controls">
          <div className="search-component__input-group">
            <input
              type="text"
              placeholder="Search"
              name="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="search-component__input"
            />
            <SearchIcon className="search-component__icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
