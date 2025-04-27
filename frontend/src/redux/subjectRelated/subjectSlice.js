import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subjectsList: [],
  subjectDetails: {},
  loading: false,
  error: null,
  response: null,
};

const subjectSlice = createSlice({
  name: 'subject',
  initialState,
  reducers: {
    getRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.response = null;
    },
    getSuccess: (state, action) => {
      state.subjectsList = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
    },
    getFailed: (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
    },
    getError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    postDone: (state) => {
      state.loading = false;
      state.response = null;
      state.error = null;
    },
    doneSuccess: (state, action) => {
      state.subjectDetails = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
    }
  },
});

export const {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  postDone,
  doneSuccess
} = subjectSlice.actions;

export const subjectReducer = subjectSlice.reducer;
