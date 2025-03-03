import { useState } from "react";
import "../styles/Filter.css"; // Make sure to import the CSS file

function Filter() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category); // Only one category can be selected
  };

  const handleMultiSelect = (value, state, setState) => {
    if (value === "All") {
      setState(["All"]); // Select "All" and clear others
    } else {
      const updated = state.includes(value)
        ? state.filter((item) => item !== value)
        : [...state.filter((item) => item !== "All"), value];
      setState(updated);
    }
  };

  return (
    <div className="filter-container">
      <h3>Category</h3>
      <div className="filter-group">
        {[
          "All",
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
              onChange={() => handleCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>

      <h3>Sub Category</h3>
      <div className="filter-group">
        {["All", "Showcase", "Workshop", "Meet up"].map((sub) => (
          <label key={sub}>
            <input
              type="checkbox"
              checked={selectedSubCategories.includes(sub)}
              onChange={() =>
                handleMultiSelect(
                  sub,
                  selectedSubCategories,
                  setSelectedSubCategories
                )
              }
            />
            {sub}
          </label>
        ))}
      </div>

      <h3>Type</h3>
      <div className="filter-group">
        {["All", "Online", "Offline-Indoors", "Offline-Outdoors"].map(
          (type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() =>
                  handleMultiSelect(type, selectedTypes, setSelectedTypes)
                }
              />
              {type}
            </label>
          )
        )}
      </div>
    </div>
  );
}

export default Filter;
