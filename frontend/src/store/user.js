import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      token: null,
      isAuthenticated: false,

      // Function to register a new user
      createUser: async (newUser) => {
        // Validate input fields
        if (
          !newUser.name ||
          !newUser.email ||
          !newUser.password ||
          !newUser.role
        ) {
          return { success: false, message: "Please fill in all the fields!" };
        }

        try {
          // Send registration request
          const res = await fetch("http://localhost:5000/api/users/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Registration failed!",
            };
          }

          console.log("API response:", data);

          set((state) => ({
            users: [...state.users, data.data],
          }));

          return { success: true, message: "User registered Successfully!!" };
        } catch (error) {
          console.error("Registration error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Function to log in a user
      loginUser: async (name, password) => {
        if (!name || !password) {
          return {
            success: false,
            message: "Please enter username and password!",
          };
        }

        try {
          const res = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, message: data.message || "Login failed!" };
          }

          // Store user data and token
          set({
            currentUser: {
              id: data._id,
              name: data.name,
              email: data.email,
              role: data.role,
              bio: data.bio || "",
            },
            token: data.token,
            isAuthenticated: true,
          });

          return { success: true, message: "Login successful!" };
        } catch (error) {
          console.error("Login error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Function to log out a user
      logoutUser: () => {
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
        });
        return { success: true, message: "Logged out successfully!" };
      },

      // Add this function inside your store definition
      getUserProfile: async () => {
        try {
          const token = get().token;
          const userId = get().currentUser?.id;

          if (!token || !userId) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch(`http://localhost:5000/api/users/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to fetch profile!",
            };
          }

          return { success: true, data: data.data };
        } catch (error) {
          console.error("Profile fetch error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },
      validateAuth: () => {
        const currentState = get();

        // If auth state is inconsistent
        if (
          (currentState.isAuthenticated && !currentState.token) ||
          (!currentState.isAuthenticated && currentState.token)
        ) {
          // Reset auth state
          set({
            currentUser: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
        return currentState.isAuthenticated;
      },

      // Function to update user profile
      updateUserProfile: async (userData) => {
        try {
          const { token, currentUser } = get();

          if (!token || !currentUser) {
            return {
              success: false,
              message: "Not authenticated!",
            };
          }

          const res = await fetch(`http://localhost:5000/api/users/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Update failed!",
            };
          }

          // Update local state with server response
          set({
            currentUser: {
              ...currentUser,
              ...data.data,
            },
          });

          return {
            success: true,
            message: "Profile updated successfully!",
            data: data.data,
          };
        } catch (error) {
          console.error("Update error:", error);
          return {
            success: false,
            message: "Network error. Please try again.",
          };
        }
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
