import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreateEvent.css";
import { useEventStore } from "../store/event.js";
import { useUserStore } from "../store/user.js";

function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID from URL
  const { getEventById, updateEvent, currentEvent } = useEventStore();
  const { currentUser, token } = useUserStore();
  const [imagePreview, setImagePreview] = useState(null);
  const [eventType, setEventType] = useState("");
  const [formData, setFormData] = useState({
    EventTitle: "",
    Description: "",
    Category: "",
    SubCategory: "",
    Type: "",
    Location: {
      Landmark: "",
      City: "",
      Country: "",
    },
    Link: "",
    Date: "",
    StartTime: "",
    EndTime: "",
    TicketQuantity: 0,
    StartDate: "",
    EndDate: "",
    newImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Helper function to format dates for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if we're logged in
        if (!token) {
          throw new Error("You must be logged in to edit an event");
        }

        // Fetch event data
        const result = await getEventById(id);
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch event");
        }

        // Check if user is allowed to edit this event
        // if (currentEvent && currentEvent.Creator !== currentUser.id) {
        //   throw new Error("You don't have permission to edit this event");
        // }

        // Populate form with existing event data
        setFormData({
          EventTitle: currentEvent.EventTitle || "",
          Description: currentEvent.Description || "",
          Category: currentEvent.Category || "",
          SubCategory: currentEvent.SubCategory || "",
          Type: currentEvent.Type || "",
          Location: {
            Landmark: currentEvent.Location?.Landmark || "",
            City: currentEvent.Location?.City || "",
            Country: currentEvent.Location?.Country || "",
          },
          Link: currentEvent.Link || "",
          Date: formatDateForInput(currentEvent.Date),
          StartTime: currentEvent.StartTime || "",
          EndTime: currentEvent.EndTime || "",
          TicketQuantity: currentEvent.TicketQuantity || 0,
          StartDate: formatDateForInput(currentEvent.StartDate),
          EndDate: formatDateForInput(currentEvent.EndDate),
          newImage: null,
        });

        // Set event type for conditional rendering
        setEventType(currentEvent.Type || "");

        // Set image preview if available
        if (currentEvent.Image) {
          setImagePreview(currentEvent.Image);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || "An error occurred");
        setIsLoading(false);

        // Navigate away on error after a short delay
        setTimeout(() => {
          navigate("/Artist_Dashboard");
        }, 2000);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id, getEventById, navigate, currentEvent, currentUser, token]);

  const discardImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      newImage: null,
    });
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    // Validate user is logged in
    if (!token) {
      alert("You must be logged in to update an event");
      return;
    }

    // Create FormData object to handle file uploads
    const eventFormData = new FormData();

    // Add all form fields to FormData
    for (const key in formData) {
      if (key === "Location") {
        // Convert location object to JSON string
        eventFormData.append("Location", JSON.stringify(formData[key]));
      } else if (key === "newImage" && formData[key] instanceof File) {
        // Add new image if it exists
        eventFormData.append("Image", formData[key]);
      } else if (key !== "newImage") {
        // Add all other fields
        eventFormData.append(key, formData[key]);
      }
    }

    try {
      // Update event in store with token
      const result = await updateEvent(id, eventFormData, token);

      if (result.success) {
        // Show success popup
        setShowSuccessPopup(true);

        // Automatically hide popup and navigate after delay
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate(`/ArtistEventPage/${id}`);
        }, 2000);
      } else {
        alert(`Failed to update event: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("An unexpected error occurred while updating the event");
    }
  };

  // Show loading or error states
  if (isLoading) {
    return <div className="loading-container">Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }
  const imageUrl = currentEvent.Image
    ? `http://localhost:5000/${currentEvent.Image}`
    : "https://picsum.photos/400/300";

  return (
    <div className="create-event">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            <div className="success-icon">✓</div>
            <h3>Event Updated Successfully!</h3>
          </div>
        </div>
      )}

      <form className="create-event-container" onSubmit={handleUpdateEvent}>
        {/* Image upload section */}
        <label htmlFor="eventbanner">
          <strong>Event Banner</strong>
        </label>
        <div className="event-banner-preview">
          {imagePreview ? (
            <img src={imageUrl} alt="Event" className="event-image" />
          ) : (
            <span>No Image Selected</span>
          )}
        </div>

        <div className="image-upload-container">
          <button type="button" onClick={discardImage}>
            Discard
          </button>
          <input
            type="file"
            id="eventbanner"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImagePreview(URL.createObjectURL(file));
                setFormData({
                  ...formData,
                  newImage: file, // Store new image file
                });
              }
            }}
          />
        </div>

        {/* Event details */}
        <div className="event-details">
          <label htmlFor="EventTitle">Event Title</label>
          <input
            type="text"
            id="EventTitle"
            name="EventTitle"
            placeholder="Enter a suitable title for the event..."
            required
            value={formData.EventTitle}
            onChange={(e) =>
              setFormData({ ...formData, EventTitle: e.target.value })
            }
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="15"
            placeholder="Enter a brief description of the event..."
            required
            value={formData.Description}
            onChange={(e) =>
              setFormData({ ...formData, Description: e.target.value })
            }
          ></textarea>
        </div>

        {/* Event category */}
        <div className="event-category">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            required
            value={formData.Category}
            onChange={(e) =>
              setFormData({ ...formData, Category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option value="Sculpting">Sculpting</option>
            <option value="Digital Art">Digital Art</option>
            <option value="Painting">Painting</option>
            <option value="Calligraphy">Calligraphy</option>
            <option value="Embroidery">Embroidery</option>
          </select>

          <label htmlFor="subCategory">Sub-category</label>
          <select
            id="subCategory"
            name="subCategory"
            required
            value={formData.SubCategory}
            onChange={(e) =>
              setFormData({ ...formData, SubCategory: e.target.value })
            }
          >
            <option value="">Select Sub-category</option>
            <option value="Showcase">Showcase</option>
            <option value="Workshop">Workshop</option>
            <option value="Meet up">Meet up</option>
          </select>
        </div>

        {/* Event type */}
        <div className="event-type">
          <label htmlFor="Type">Type</label>
          <select
            id="Type"
            name="Type"
            required
            value={formData.Type}
            onChange={(e) => {
              setEventType(e.target.value);
              setFormData((prev) => {
                const updated = {
                  ...prev,
                  Type: e.target.value,
                };

                if (e.target.value === "Online") {
                  updated.Location = {
                    Landmark: "Online Event",
                    City: "Virtual",
                    Country: "Global",
                  };
                }

                return updated;
              });
            }}
          >
            <option value="">Select Type</option>
            <option value="Online">Online</option>
            <option value="Offline-outdoors">Offline-outdoors</option>
            <option value="Offline-indoors">Offline-indoors</option>
          </select>
        </div>

        {/* Event location */}
        <div className="event-location-container">
          {eventType === "Online" ? (
            <div className="online-container">
              <label htmlFor="link">Event Link</label>
              <input
                type="text"
                id="link"
                name="link"
                placeholder="Enter event link..."
                required
                value={formData.Link}
                onChange={(e) =>
                  setFormData({ ...formData, Link: e.target.value })
                }
              />
            </div>
          ) : (
            <div className="offline-container">
              <label htmlFor="landmark">Location</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                placeholder="Landmark"
                required
                value={formData.Location.Landmark}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Location: {
                      ...formData.Location,
                      Landmark: e.target.value,
                    },
                  })
                }
              />
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                required
                value={formData.Location.City}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Location: {
                      ...formData.Location,
                      City: e.target.value,
                    },
                  })
                }
              />
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Country"
                required
                value={formData.Location.Country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Location: {
                      ...formData.Location,
                      Country: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="event-date-time">
          <h3>Date & Time</h3>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.Date}
            onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
          />

          <div className="time-selection">
            <div className="time-input">
              <label htmlFor="starttime">Start</label>
              <input
                type="time"
                id="starttime"
                name="starttime"
                required
                value={formData.StartTime}
                onChange={(e) =>
                  setFormData({ ...formData, StartTime: e.target.value })
                }
              />
            </div>
            <div className="time-input">
              <label htmlFor="endTime">End</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                required
                value={formData.EndTime}
                onChange={(e) =>
                  setFormData({ ...formData, EndTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Ticket section */}
        <div className="event-ticketing">
          <div className="ticket-quantity">
            <label htmlFor="ticket">Ticket</label>
            <p>Quantity</p>
            <input
              type="number"
              id="ticket"
              name="ticket"
              placeholder="Quantity"
              required
              value={formData.TicketQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  TicketQuantity: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="ticket-availability">
            <h3>Ticket Availability</h3>
            <div className="time-selection">
              <div className="time-input">
                <label htmlFor="startdate">Start</label>
                <input
                  type="date"
                  id="startdate"
                  name="startdate"
                  required
                  value={formData.StartDate}
                  onChange={(e) =>
                    setFormData({ ...formData, StartDate: e.target.value })
                  }
                />
              </div>
              <div className="time-input">
                <label htmlFor="enddate">End</label>
                <input
                  type="date"
                  id="enddate"
                  name="enddate"
                  required
                  value={formData.EndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, EndDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="event-buttons-create">
          <button
            type="button"
            className="cancel-button-create"
            onClick={() => navigate(`/ArtistEventPage/${id}`)}
          >
            Cancel
          </button>
          <button type="submit" className="create-button-create">
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEventPage;
