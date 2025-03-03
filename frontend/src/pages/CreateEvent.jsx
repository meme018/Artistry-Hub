import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Artistbar from "../components/Artistbar";
import "../styles/CreateEvent.css";
import { useEventStore } from "../store/event.js";

function CreateEvent() {
  const [image, setImage] = useState(null);
  const [eventType, setEventType] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const [newEvent, setNewEvent] = useState({
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
    Date: "",
    StartTime: "",
    EndTime: "",
    TicketQuantity: 0,
    StartDate: "",
    EndDate: "",
  });

  const discardImage = () => {
    setImage(null);
    document.getElementById("eventbanner").value = "";
  };

  const { createEvent } = useEventStore();

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    // Check if image is selected
    if (!newEvent.Image) {
      alert("Please upload an event banner!");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("Image", newEvent.Image);
    formData.append("EventTitle", newEvent.EventTitle);
    formData.append("Description", newEvent.Description);
    formData.append("Category", newEvent.Category);
    formData.append("SubCategory", newEvent.SubCategory);
    formData.append("Type", newEvent.Type);
    formData.append("Link", newEvent.Link);
    formData.append("Location", JSON.stringify(newEvent.Location));
    formData.append("Date", newEvent.Date);
    formData.append("StartTime", newEvent.StartTime);
    formData.append("EndTime", newEvent.EndTime);
    formData.append("TicketQuantity", newEvent.TicketQuantity);
    formData.append("StartDate", newEvent.StartDate);
    formData.append("EndDate", newEvent.EndDate);

    const { success, message } = await createEvent(formData);

    if (success) {
      alert("Event created successfully!");
      navigate("/Artistbar");
    } else {
      alert(`Event creation failed: ${message}`);
    }
  };

  return (
    <div className="create-event">
      <div className="create-sidebar">
        <Artistbar />
      </div>
      <form className="create-event-container" onSubmit={handleCreateEvent}>
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
          <button onClick={discardImage}>Discard</button>
          <input
            type="file"
            id="eventbanner"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(URL.createObjectURL(file)); // For preview
                setNewEvent((prevEvent) => ({
                  ...prevEvent,
                  Image: file, // Store the file object
                }));
              }
            }}
          />
        </div>

        <div className="event-details">
          <label htmlFor="EventTitle">Event Title</label>
          <input
            type="text"
            id="EventTitle"
            name="EventTitle"
            placeholder="Enter a suitable title for the event..."
            required
            value={newEvent.EventTitle}
            onChange={(e) =>
              setNewEvent({ ...newEvent, EventTitle: e.target.value })
            }
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="15"
            placeholder="Enter a brief description of the event..."
            required
            value={newEvent.Description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, Description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="event-category">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            required
            value={newEvent.Category}
            onChange={(e) =>
              setNewEvent({ ...newEvent, Category: e.target.value })
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
            value={newEvent.SubCategory}
            onChange={(e) =>
              setNewEvent({ ...newEvent, SubCategory: e.target.value })
            }
          >
            <option value="">Select Sub-category</option>
            <option value="Showcase">Showcase</option>
            <option value="Workshop">Workshop</option>
            <option value="Meet up">Meet up</option>
          </select>
        </div>

        <div className="event-type">
          <label htmlFor="Type">Type</label>
          <select
            id="Type"
            name="Type"
            required
            value={newEvent.Type} // Use only newEvent.Type
            onChange={(e) => {
              setEventType(e.target.value);
              setNewEvent((prevEvent) => ({
                ...prevEvent,
                Type: e.target.value,
              }));
            }}
          >
            <option value="">Select Type</option>
            <option value="Online">Online</option>
            <option value="Offline-indoors">Offline-indoors</option>
            <option value="Offline-outdoors">Offline-outdoors</option>
          </select>
        </div>

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
                value={newEvent.Link}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, Link: e.target.value })
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
                value={newEvent.Location.Landmark}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    Location: {
                      ...newEvent.Location,
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
                value={newEvent.Location.City}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    Location: {
                      ...newEvent.Location,
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
                value={newEvent.Location.Country}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    Location: {
                      ...newEvent.Location,
                      Country: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="event-date-time">
          <h3>Date & Time</h3>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={newEvent.Date}
            onChange={(e) => setNewEvent({ ...newEvent, Date: e.target.value })}
          />

          <div className="time-selection">
            <div className="time-input">
              <label htmlFor="starttime">Start</label>
              <input
                type="time"
                id="starttime"
                name="starttime"
                required
                value={newEvent.StartTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, StartTime: e.target.value })
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
                value={newEvent.EndTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, EndTime: e.target.value })
                }
              />
            </div>
          </div>
        </div>

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
              value={newEvent.TicketQuantity}
              onChange={(e) =>
                setNewEvent({ ...newEvent, TicketQuantity: e.target.value })
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
                  value={newEvent.StartDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, StartDate: e.target.value })
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
                  value={newEvent.EndDate}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, EndDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="event-buttons">
          <button className="cancel-button">
            <Link to="/Artistbar">Cancel</Link>
          </button>
          <button type="submit" className="create-button">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
