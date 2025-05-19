// redux/complainRelated/complainHandle.js
import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getFailed,
  getError
} from './complainSlice';

const BASE_URL = "http://localhost:5001/api";

export const getAllComplains = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/complains/school/${schoolId}`);
    console.log("🧪 Ответ с сервера:", res.data);
    if (res.data.message) {
      dispatch(getFailed(res.data.message));
    } else {
      dispatch(getSuccess(res.data));
    }
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

export const deleteComplain = (id, schoolId) => async (dispatch) => {
  try {
    await axios.delete(`${BASE_URL}/complains/${id}`);
    dispatch(getAllComplains(schoolId));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};
