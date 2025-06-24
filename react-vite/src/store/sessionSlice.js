// react-vite/src/store/sessionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "./axiosConfig";

// 🔁 Restore session
export const thunkAuthenticate = createAsyncThunk(
  "session/authenticate",
  async (_, { rejectWithValue }) => {
    try {
      // GET /api/auth/me → returns user object
      const { data } = await axios.get("/auth/me");
      return data;
    } catch (err) {
      // if 401 or network error, we'll wind up here
      return rejectWithValue(err.response?.data || { error: "Not authenticated" });
    }
  }
);

// 🔑 Login
export const thunkLogin = createAsyncThunk(
  "session/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // POST /api/auth/login { email, password }
      const { data } = await axios.post("/auth/login", { email, password });
      // data should be { user: { ... } }
      return data;
    } catch (err) {
      // bubble up backend errors
      return rejectWithValue(err.response?.data || { error: "Login failed" });
    }
  }
);

// 🚪 Logout
export const thunkLogout = createAsyncThunk(
  "session/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/auth/logout");
      // nothing to return
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: "Logout failed" });
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState: { user: null, status: "idle", error: null },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // authenticate
      .addCase(thunkAuthenticate.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(thunkAuthenticate.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload;           // payload is the user object
      })
      .addCase(thunkAuthenticate.rejected, (state, { payload }) => {
        state.status = "failed";
        state.user = null;
        state.error = payload.error;
      })

      // login
      .addCase(thunkLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(thunkLogin.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.user = payload.user;      // payload.user is the user object
      })
      .addCase(thunkLogin.rejected, (state, { payload }) => {
        state.status = "failed";
        state.error = payload.error;
      })

      // logout
      .addCase(thunkLogout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(thunkLogout.rejected, (state, { payload }) => {
        state.error = payload.error;
      });
  },
});

export const { setUser } = sessionSlice.actions;
export default sessionSlice.reducer;
