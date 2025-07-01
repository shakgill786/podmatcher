import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../store/axiosConfig";        // ← use axios, not csrfFetch

export const getAllUsersThunk = createAsyncThunk(
  "users/fetchAll",
  async () => {
    const { data } = await axios.get("/users");  // ← relative to baseURL
    return data;
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllUsersThunk.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default usersSlice.reducer;
