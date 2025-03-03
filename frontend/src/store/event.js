import { create } from "zustand";

export const useEventStore = create((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  currentEvent: null,

  createEvent: async (newEvent) => {
    // Validate input fields
    if (
      !newEvent.EventTitle ||
      !newEvent.Description ||
      !newEvent.Category ||
      !newEvent.SubCategory ||
      !newEvent.Type ||
      !newEvent.Date ||
      !newEvent.StartTime ||
      !newEvent.EndTime ||
      newEvent.TicketQuantity == null || // Check for null/undefined instead of falsy
      !newEvent.StartDate ||
      !newEvent.EndDate
    ) {
      return { success: false, message: "Please fill in all the fields!" };
    }
    // Send registration request
    createEvent: async (formData) => {
      const res = await fetch("/api/events/create", {
        method: "POST",
        body: formData, // No headers needed for FormData
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          events: [...state.events, data.data],
        }));
        return { success: true, message: "Event created Successfully!!" };
      } else {
        return {
          success: false,
          message: data.message || "Event creation failed.",
        };
      }
    };
  },
}));
