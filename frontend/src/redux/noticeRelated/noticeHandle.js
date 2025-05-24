import axios from 'axios';
import {
  getRequest, getSuccess, getFailed, getError,
} from './noticeSlice';

const BASE_URL = 'http://localhost:5001/api';

export const getAllNotices = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${BASE_URL}/notices/school/${schoolId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error.response?.data?.message || error.message));
  }
};
