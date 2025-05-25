import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      bannedUsers: [],
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

        // Email validation
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(newUser.email)) {
          return {
            success: false,
            message: "Please enter a valid email address!",
          };
        }

        // Password validation
        if (newUser.password.length < 5) {
          return {
            success: false,
            message: "Password must be at least 5 characters long!",
          };
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
            // Handle banned user case
            if (res.status === 403 && data.banReason) {
              return {
                success: false,
                message: data.message,
                isBanned: true,
                banInfo: {
                  reason: data.banReason,
                  date: data.bannedAt,
                },
              };
            }
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

      // Get user profile
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

      // Add this function to your useUserStore

      // Function for admin to update other users
      updateUserById: async (userId, userData) => {
        try {
          const token = get().token;
          const currentUser = get().currentUser;

          if (!token) {
            return {
              success: false,
              message: "Not authenticated!",
            };
          }

          // Check if current user is an admin
          if (currentUser.role !== "Admin") {
            return {
              success: false,
              message: "Not authorized to update other users!",
            };
          }

          const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
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

          // Update local state by refreshing users list
          await get().getAllUsers();

          return {
            success: true,
            message: "User updated successfully!",
            data: data.data,
          };
        } catch (error) {
          console.error("Admin update user error:", error);
          return {
            success: false,
            message: "Network error. Please try again.",
          };
        }
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

      // Get all users (admin function)
      getAllUsers: async () => {
        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch("http://localhost:5000/api/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to fetch users!",
            };
          }

          set({ users: data.data });
          return { success: true, data: data.data };
        } catch (error) {
          console.error("User fetch error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Get banned users (admin function)
      getBannedUsers: async () => {
        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch("http://localhost:5000/api/users/banned", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to fetch banned users!",
            };
          }

          set({ bannedUsers: data.data });
          return { success: true, data: data.data };
        } catch (error) {
          console.error("Banned users fetch error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Ban a user (admin function)
      banUser: async (userId, reason) => {
        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch(
            `http://localhost:5000/api/users/${userId}/ban`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ reason }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to ban user!",
            };
          }

          // Update local state if needed
          await get().getAllUsers();
          await get().getBannedUsers();

          return { success: true, message: "User banned successfully!" };
        } catch (error) {
          console.error("Ban user error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Unban a user (admin function)
      unbanUser: async (userId) => {
        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch(
            `http://localhost:5000/api/users/${userId}/unban`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to unban user!",
            };
          }

          // Update local state if needed
          await get().getAllUsers();
          await get().getBannedUsers();

          return { success: true, message: "User unbanned successfully!" };
        } catch (error) {
          console.error("Unban user error:", error);
          return { success: false, message: "Server error. Please try again." };
        }
      },

      // Delete a user (admin function)
      deleteUser: async (userId) => {
        try {
          const token = get().token;

          if (!token) {
            return { success: false, message: "Not authenticated!" };
          }

          const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Failed to delete user!",
            };
          }

          // Update local state
          set((state) => ({
            users: state.users.filter((user) => user._id !== userId),
            bannedUsers: state.bannedUsers.filter(
              (user) => user._id !== userId
            ),
          }));

          return { success: true, message: "User deleted successfully!" };
        } catch (error) {
          console.error("Delete user error:", error);
          return { success: false, message: "Server error. Please try again." };
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
