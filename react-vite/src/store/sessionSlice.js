// react-vite/src/store/sessionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "./axiosConfig";

export const thunkSignup = createAsyncThunk("session/signup", async (userData, thunkAPI) => {
  const res = await axios.post("/auth/signup", userData);
  return res.data;
});

export const thunkLogin = createAsyncThunk("session/login", async (credentials, thunkAPI) => {
  const res = await axios.post("/auth/login", credentials);
  return res.data;
});

export const thunkLogout = createAsyncThunk("session/logout", async () => {
  const res = await axios.post("/auth/logout");
  return res.data;
});

export const thunkAuthenticate = createAsyncThunk("session/authenticate", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/auth/me");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(null);
  }
});

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    user: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(thunkSignup.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(thunkLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(thunkLogout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(thunkAuthenticate.fulfilled, (state, action) => {
        if (action.payload?.id) state.user = action.payload; // ✅ full object
      })
      .addCase(thunkAuthenticate.rejected, (state) => {
        state.user = null;
      });
  },
});

export default sessionSlice.reducer;
