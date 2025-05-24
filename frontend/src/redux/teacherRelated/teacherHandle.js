import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  postDone,
  doneSuccess,
} from './teacherSlice';

const BASE_URL = 'http://localhost:5001/api/teachers';

// === Получить всех преподавателей школы ===
export const getAllTeachers = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${BASE_URL}/school/${schoolId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === Получить преподавателей с предметами и классами ===
export const getGroupedTeacherSubjects = () => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get('http://localhost:5001/api/teacherSubjectClass/grouped');
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === Получить детали одного преподавателя ===
export const getTeacherDetails = (teacherId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${BASE_URL}/${teacherId}`);
    if (result.data && !result.data.message) {
      dispatch(doneSuccess(result.data));
    } else {
      dispatch(getFailed(result.data.message || 'Ошибка получения преподавателя'));
    }
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === Обновить предмет преподавателя ===
export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.put(`${BASE_URL}/update-subject`, { teacherId, teachSubject }, {
      headers: { 'Content-Type': 'application/json' },
    });
    dispatch(postDone());
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};
