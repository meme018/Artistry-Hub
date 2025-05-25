import { create } from "zustand";

export const useEventStore = create((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  currentEvent: null,
  hasOngoingEvents: false, // New state to track ongoing events

  // Fetch all events
  fetchEvents: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();

      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/events${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch events");
      }

      const data = await res.json();
      set({ events: data.data, isLoading: false });

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error fetching events:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Fetch events created by the current artist
  fetchArtistEvents: async (token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch("http://localhost:5000/api/events/artist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch artist events");
      }

      const data = await res.json();

      // Store these events in the events array
      set({ events: data.data, isLoading: false });

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error fetching artist events:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Check if artist has ongoing events
  checkOngoingEvents: async (token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(
        "http://localhost:5000/api/events/artist/ongoing",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to check ongoing events");
      }

      const data = await res.json();
      set({ hasOngoingEvents: data.hasOngoingEvents, isLoading: false });

      return {
        success: true,
        hasOngoingEvents: data.hasOngoingEvents,
        ongoingEvents: data.ongoingEvents || [],
      };
    } catch (error) {
      console.error("Error checking ongoing events:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Create a new event
  createEvent: async (formData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      // First check if artist has ongoing events
      const ongoingCheck = await get().checkOngoingEvents(token);
      if (ongoingCheck.hasOngoingEvents) {
        throw new Error(
          "You cannot create a new event until your ongoing events are completed"
        );
      }

      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        body: formData, // Send FormData directly
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Event creation failed");
      }

      const data = await res.json();

      set((state) => ({
        events: [...state.events, data.data],
        isLoading: false,
      }));

      return {
        success: true,
        message: "Event created successfully!",
        data: data.data,
      };
    } catch (error) {
      console.error("Error creating event:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Update existing event - Improved
  updateEvent: async (id, formData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      console.log("Updating event with ID:", id);

      // Log FormData entries (for debugging)
      console.log("Form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is automatically set by browser with FormData
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Event update failed");
      }

      const data = await res.json();
      console.log("Update response:", data);

      // Update events array and currentEvent
      set((state) => ({
        events: state.events.map((event) =>
          event._id === id ? data.data : event
        ),
        currentEvent: data.data,
        isLoading: false,
      }));

      return {
        success: true,
        message: "Event updated successfully!",
        data: data.data,
      };
    } catch (error) {
      console.error("Error updating event:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Mark event as completed
  markEventCompleted: async (id, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(
        `http://localhost:5000/api/events/${id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Failed to mark event as completed"
        );
      }

      const data = await res.json();

      // Update events array
      set((state) => ({
        events: state.events.map((event) =>
          event._id === id ? data.data : event
        ),
        isLoading: false,
      }));

      return {
        success: true,
        message: "Event marked as completed!",
        data: data.data,
      };
    } catch (error) {
      console.error("Error marking event as completed:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Delete an event
  deleteEvent: async (id, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Event deletion failed");
      }

      set((state) => ({
        events: state.events.filter((event) => event._id !== id),
        isLoading: false,
      }));

      return { success: true, message: "Event deleted successfully!" };
    } catch (error) {
      console.error("Error deleting event:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Get a single event by ID
  getEventById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // First check if the event is already in our state
      const existingEvent = get().events.find((event) => event._id === id);

      if (existingEvent) {
        set({ currentEvent: existingEvent, isLoading: false });
        return { success: true, data: existingEvent };
      }

      // If not in state, fetch from API
      const res = await fetch(`http://localhost:5000/api/events/${id}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch event");
      }

      const data = await res.json();
      set({ currentEvent: data.data, isLoading: false });

      return { success: true, data: data.data };
    } catch (error) {
      console.error("Error fetching event:", error);
      set({ error: error.message, isLoading: false });
      return { success: false, message: error.message };
    }
  },

  // Set current event (used for editing)
  setCurrentEvent: (event) => set({ currentEvent: event }),

  // Clear current event
  clearCurrentEvent: () => set({ currentEvent: null }),

  // Filter events by category, subcategory, type, etc.
  filterEvents: (criteria) => {
    const { events } = get();
    let filteredEvents = [...events];

    // First, filter out events that have already ended
    const currentDate = new Date();
    filteredEvents = filteredEvents.filter((event) => {
      // Check EventDate first
      if (event.EventDate) {
        const eventDate = new Date(event.EventDate);
        if (eventDate >= currentDate) {
          return true; // Event hasn't started or is ongoing
        }
      }

      // If EventDate has passed, check EndDate to see if event is still ongoing
      if (event.EndDate) {
        const endDate = new Date(event.EndDate);
        if (endDate >= currentDate) {
          return true; // Event is still ongoing
        }
      }

      // If no valid future dates found, exclude the event
      return false;
    });

    // Category filter
    if (criteria.category) {
      filteredEvents = filteredEvents.filter(
        (event) => event.Category === criteria.category
      );
    }

    // SubCategory filter
    if (criteria.subCategory) {
      filteredEvents = filteredEvents.filter(
        (event) => event.SubCategory === criteria.subCategory
      );
    }

    // Type filter
    if (criteria.type) {
      filteredEvents = filteredEvents.filter(
        (event) => event.Type === criteria.type
      );
    }

    // Payment type filter
    if (criteria.isPaid !== undefined) {
      filteredEvents = filteredEvents.filter(
        (event) => event.IsPaid === criteria.isPaid
      );
    }

    // General search (title and description)
    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) =>
          (event.EventTitle &&
            event.EventTitle.toLowerCase().includes(searchLower)) ||
          (event.Description &&
            event.Description.toLowerCase().includes(searchLower))
      );
    }

    // Location search (with robust null checks)
    if (criteria.locationTerm) {
      const locationLower = criteria.locationTerm.toLowerCase();
      filteredEvents = filteredEvents.filter((event) => {
        // Safely get location string from Location object and other location fields
        const locationParts = [];

        // Handle nested Location object
        if (event.Location) {
          if (event.Location.Landmark)
            locationParts.push(event.Location.Landmark);
          if (event.Location.City) locationParts.push(event.Location.City);
          if (event.Location.Country)
            locationParts.push(event.Location.Country);
        }

        // Handle any other potential location fields
        if (event.City) locationParts.push(event.City);
        if (event.Country) locationParts.push(event.Country);
        if (event.Venue?.name) locationParts.push(event.Venue.name);
        if (event.Address) locationParts.push(event.Address);

        const locationString = locationParts
          .filter(Boolean) // Remove falsy values
          .join(" ") // Combine into searchable string
          .toLowerCase();

        return locationString.includes(locationLower);
      });
    }

    return filteredEvents;
  },
}));
