import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import csrfFetch from "./csrf";

export const getAllUsersThunk = createAsyncThunk("users/fetchAll", async () => {
    const res = await csrfFetch("http://localhost:5000/api/users/");
    const data = await res.json();
    return data;
  });

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
