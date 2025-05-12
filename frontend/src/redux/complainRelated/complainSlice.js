// complainSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  complains: [],
  status: null,
  error: null
};

const complainSlice = createSlice({
  name: "complain",
  initialState,
  reducers: {
    getRequest: (state) => {
      state.status = "loading";
    },
    getSuccess: (state, action) => {
      state.status = "success";
      state.complains = action.payload;
    },
    getFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
    getError: (state, action) => {
      state.status = "error";
      state.error = action.payload;
    },
    clearComplainState: (state) => {
      state.complains = [];
      state.status = null;
      state.error = null;
    }
  }
});

export const {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  clearComplainState
} = complainSlice.actions;


export default complainSlice.reducer;
