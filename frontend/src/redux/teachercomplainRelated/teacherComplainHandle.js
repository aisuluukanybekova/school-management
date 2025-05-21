import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getError
} from './teacherComplainSlice';

const BASE_URL = 'http://localhost:5001/api';

// Получить все жалобы учителей
export const getAllTeacherComplains = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/teacher-complains/school/${schoolId}`);
    dispatch(getSuccess(res.data));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// Удалить жалобу учителя
export const deleteTeacherComplain = (id, schoolId) => async (dispatch) => {
  try {
    await axios.delete(`${BASE_URL}/teacher-complains/${id}`);
    dispatch(getAllTeacherComplains(schoolId));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};
