import axios from 'axios';
import {
  topicRequest,
  topicSuccess,
  topicSaveSuccess,
  topicError
} from './lessonTopicSlice';

export const fetchLessonTopics = (params) => async (dispatch) => {
  dispatch(topicRequest());
  try {
    const { data } = await axios.get('/api/lesson-topics', { params });
    dispatch(topicSuccess(data));
  } catch (error) {
    dispatch(topicError(error?.response?.data?.message || error.message));
  }
};

export const saveLessonTopics = (payload) => async (dispatch) => {
  dispatch(topicRequest());
  try {
    await axios.post('/api/lesson-topics', payload);
    dispatch(topicSaveSuccess());
  } catch (error) {
    dispatch(topicError(error?.response?.data?.message || error.message));
  }
};
