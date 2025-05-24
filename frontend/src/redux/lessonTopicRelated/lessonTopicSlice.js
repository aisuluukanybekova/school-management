import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  topics: [],
  success: false,
};

const lessonTopicSlice = createSlice({
  name: 'lessonTopics',
  initialState,
  reducers: {
    topicRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    topicSuccess: (state, action) => {
      state.loading = false;
      state.topics = action.payload;
      state.success = true;
    },
    topicSaveSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    topicError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetTopicState: () => initialState,
  },
});

export const {
  topicRequest,
  topicSuccess,
  topicSaveSuccess,
  topicError,
  resetTopicState,
} = lessonTopicSlice.actions;

export default lessonTopicSlice.reducer;
