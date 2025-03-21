import { create } from "zustand";

export const useEventStore = create((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  currentEvent: null,
  createEvent: async (formData) => {
    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        body: formData, // Send FormData directly
        // Do NOT set Content-Type header; the browser will set it automatically
      });

      console.log("Response status:", res.status); // Log the status code
      const text = await res.text(); // Get the raw response text
      console.log("Response text:", text); // Log the raw response

      if (!res.ok) {
        const errorData = JSON.parse(text); // Parse the error response
        throw new Error(errorData.message || "Event creation failed");
      }

      const data = JSON.parse(text); // Parse the success response
      set((state) => ({
        events: [...state.events, data.data],
      }));

      return { success: true, message: "Event created successfully!" };
    } catch (error) {
      console.error("Error creating event:", error);
      return { success: false, message: error.message };
    }
  },
}));
