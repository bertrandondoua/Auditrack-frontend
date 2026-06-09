import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

// Mirrors the backend `accounts.User.role` enum (openapi.json).
export type Role = "clerk" | "chief_clerk" | "president" | "it_manager";

import type { User } from "@/types/user";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

function readUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (err) {
    console.error("Error parsing user from localStorage", err);
    return null;
  }
}

const initialState: AuthState = {
  user: readUserFromStorage(),
  isAuthenticated: typeof window !== "undefined" && window.localStorage.getItem("user") !== null,
};

function persistUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    try {
      window.localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Error persisting user to localStorage", err);
    }
  } else {
    window.localStorage.removeItem("user");
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Persist so the initial-state read on next mount picks up the same user
      // and we don't refetch /accounts/users/me/ unnecessarily on hard refresh.
      persistUser(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      persistUser(null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
