// react-vite/src/store/sessionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 🌍 Define backend API base URL
const BASE_URL = "http://127.0.0.1:5000";

// 🔐 CSRF-aware fetcher
const csrfFetch = async (endpoint, options = {}) => {
  options.method = options.method || "GET";
  options.headers = options.headers || {};

  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] = "application/json";

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

    if (csrfToken) {
      options.headers["X-CSRFToken"] = csrfToken;
    }
  }

  options.credentials = "include";

  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("🛰️ Sending request to", fullUrl, options);

  const res = await fetch(fullUrl, options);
  return res;
};

// 🔁 Check if user is logged in
export const thunkAuthenticate = createAsyncThunk(
  "session/authenticate",
  async () => {
    const res = await csrfFetch("/api/auth/me");
    if (res.ok) return await res.json();
    throw new Error("Not authenticated");
  }
);

// 🔑 Login
export const thunkLogin = createAsyncThunk(
  "session/login",
  async (credentials, { rejectWithValue }) => {
    const res = await csrfFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) return rejectWithValue(data);
    return data;
  }
);

// 🚪 Logout
export const thunkLogout = createAsyncThunk("session/logout", async () => {
  await csrfFetch("/api/auth/logout", { method: "POST" });
});

// 🧠 Session slice
const sessionSlice = createSlice({
  name: "session",
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(thunkAuthenticate.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(thunkLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(thunkLogout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = sessionSlice.actions;
export default sessionSlice.reducer;
