import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CreateEvent.css";
import { useEventStore } from "../store/event.js";
import { useUserStore } from "../store/user.js";

function CreateEvent() {
  const [image, setImage] = useState(null);
  const [eventType, setEventType] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [hasOngoingEvents, setHasOngoingEvents] = useState(false);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const navigate = useNavigate();
  const { createEvent, checkOngoingEvents } = useEventStore();
  const { isAuthenticated } = useUserStore();
  const token = useUserStore((state) => state.token);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if artist has ongoing events
    const checkForOngoingEvents = async () => {
      const result = await checkOngoingEvents(token);
      if (result.success) {
        setHasOngoingEvents(result.hasOngoingEvents);
        setOngoingEvents(result.ongoingEvents || []);
      }
    };

    checkForOngoingEvents();
  }, [isAuthenticated, navigate, checkOngoingEvents, token]);

  const [formData, setFormData] = useState({
    EventTitle: "",
    Description: "",
    Category: "",
    SubCategory: "",
    Type: "",
    Link: "",
    Location: {
      Landmark: "",
      City: "",
      Country: "",
    },
    EventDate: "",
    StartTime: "",
    EndTime: "",
    TicketQuantity: 0,
    StartDate: "",
    EndDate: "",
    Image: null,
    // Payment fields
    IsPaid: false,
    Price: 0,
  });

  const discardImage = () => {
    setImage(null);
    setFormData({ ...formData, Image: null });
    document.getElementById("eventbanner").value = "";
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError("");

    // Check if artist has ongoing events
    const ongoingCheck = await checkOngoingEvents(token);
    if (ongoingCheck.hasOngoingEvents) {
      setFormError(
        "You cannot create a new event until your ongoing events are completed"
      );
      return;
    }

    // Basic form validation
    if (
      !formData.EventTitle ||
      !formData.Description ||
      !formData.Category ||
      !formData.Type
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    // Validation for paid events
    if (formData.IsPaid && (!formData.Price || formData.Price <= 0)) {
      setFormError("Please enter a valid price for paid events");
      return;
    }

    // Create FormData object
    const formDataToSend = new FormData();

    // Append all form fields
    if (formData.Image) {
      formDataToSend.append("Image", formData.Image);
    }
    formDataToSend.append("EventTitle", formData.EventTitle);
    formDataToSend.append("Description", formData.Description);
    formDataToSend.append("Category", formData.Category);
    formDataToSend.append("SubCategory", formData.SubCategory);
    formDataToSend.append("Type", formData.Type);

    if (formData.Link) {
      formDataToSend.append("Link", formData.Link);
    }

    formDataToSend.append("Location", JSON.stringify(formData.Location));

    // Fix: Change 'Date' to 'EventDate' to match what the backend expects
    formDataToSend.append("EventDate", formData.EventDate);

    formDataToSend.append("StartTime", formData.StartTime);
    formDataToSend.append("EndTime", formData.EndTime);
    formDataToSend.append("TicketQuantity", formData.TicketQuantity);
    formDataToSend.append("StartDate", formData.StartDate);
    formDataToSend.append("EndDate", formData.EndDate);

    // Add payment fields
    formDataToSend.append("IsPaid", formData.IsPaid);
    // Only include price if it's a paid event
    if (formData.IsPaid) {
      formDataToSend.append("Price", formData.Price);
    }

    try {
      // Debug log to see token
      console.log("Using token:", token);

      // Pass token as a separate parameter to createEvent
      const result = await createEvent(formDataToSend, token);

      if (result.success) {
        // Show success popup
        setShowSuccessPopup(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/Artist_Dashboard");
        }, 2000);
      } else {
        setFormError(result.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setFormError("Failed to create event. Please try again.");
    }
  };

  // Toggle for paid events
  const handlePaidToggle = (e) => {
    const isPaid = e.target.checked;
    setFormData({
      ...formData,
      IsPaid: isPaid,
      // Reset price to 0 when toggling to free event
      Price: isPaid ? formData.Price : 0,
    });
  };

  // If artist has ongoing events, show message and option to view them
  if (hasOngoingEvents) {
    return (
      <div className="create-event">
        <div className="ongoing-events-message">
          <h2>Cannot Create New Event</h2>
          <p>
            You currently have ongoing events that must be completed before
            creating a new event.
          </p>

          <div className="ongoing-events-actions">
            <Link to="/OngoingEvent" className="view-ongoing-button">
              View My Ongoing Events
            </Link>
            <Link to="/Artist_Dashboard" className="back-to-dashboard">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="success-popup-content">
            <div className="success-icon">✅</div>
            <h3>Success!</h3>
            <p>Your event has been created successfully.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {formError && <div className="error-message">{formError}</div>}
      <form className="create-event-container" onSubmit={handleCreateEvent}>
        {/* Image upload section */}
        <label htmlFor="eventbanner">
          <strong>Event Banner</strong>
        </label>
        <div className="event-banner-preview">
          {image ? (
            <img src={image} alt="Preview" className="event-image-preview" />
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
                setImage(URL.createObjectURL(file));
                setFormData({ ...formData, Image: file });
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

        {/* Rest of the form remains the same */}
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
            value={formData.EventDate}
            onChange={(e) =>
              setFormData({ ...formData, EventDate: e.target.value })
            }
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

        {/* Payment Section */}
        <div className="event-payment">
          <h3>Ticketing</h3>
          <div className="payment-type">
            <label className="payment-toggle">
              <input
                type="checkbox"
                checked={formData.IsPaid}
                onChange={handlePaidToggle}
              />
              <span className="toggle-label">
                {formData.IsPaid ? "Paid Event" : "Free Event"}
              </span>
            </label>
          </div>

          {formData.IsPaid && (
            <div className="price-input">
              <label htmlFor="price">Ticket Price (NPR)</label>
              <input
                type="number"
                id="price"
                name="price"
                min="1"
                step="any"
                placeholder="Enter ticket price"
                required={formData.IsPaid}
                value={formData.Price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Price: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="price-note">
                Payment will be processed through Khalti
              </p>
            </div>
          )}
        </div>

        {/* Form buttons */}
        <div className="event-buttons-create">
          <button type="button" className="cancel-button-create">
            <Link to="/Artist_Dashboard">Cancel</Link>
          </button>
          <button type="submit" className="create-button-create">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
