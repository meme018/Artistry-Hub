import { create } from "zustand";

export const useUserStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  currentUser: null,

  // Function to register a new user
  createUser: async (newUser) => {
    // Validate input fields
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      return { success: false, message: "Please fill in all the fields!" };
    }
    // Send registration request
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    console.log("API response:", data);
    set((state) => ({
      users: [...state.users, data.data],
    }));
    return { success: true, message: "User registered Successfully!!" };
  },

  // Function to log in a user
  loginUser: async (name, password) => {
    if (!name || !password) {
      return { success: false, message: "Please enter username and password!" };
    }

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Login failed!" };
      }

      // Ensure backend returns role in response
      set({
        currentUser: {
          name: data.data.name,
          role: data.data.role, // Make sure backend sends this
          // other user properties...
        },
      });

      return { success: true, message: "Login successful!" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Server error. Please try again." };
    }
  },
}));
