// redux/teacherComplainSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  teacherComplains: [],
  status: null,
  error: null
};

const teacherComplainSlice = createSlice({
  name: "teacherComplain",
  initialState,
  reducers: {
    getRequest: (state) => { state.status = "loading"; },
    getSuccess: (state, action) => {
      state.status = "success";
      state.teacherComplains = action.payload;
    },
    getError: (state, action) => {
      state.status = "error";
      state.error = action.payload;
    }
  }
});

export const { getRequest, getSuccess, getError } = teacherComplainSlice.actions;
export default teacherComplainSlice.reducer;
