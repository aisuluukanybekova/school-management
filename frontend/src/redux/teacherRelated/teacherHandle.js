import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  postDone,
  doneSuccess
} from './teacherSlice';

const REACT_APP_BASE_URL = "http://localhost:5001/api/teachers";

// === Получить всех преподавателей школы ===
export const getAllTeachers = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${REACT_APP_BASE_URL}/school/${schoolId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

// === Получить детали одного преподавателя ===
export const getTeacherDetails = (teacherId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${REACT_APP_BASE_URL}/${teacherId}`);
    if (result.data && !result.data.message) {
      dispatch(doneSuccess(result.data));
    } else {
      dispatch(getFailed(result.data.message || "Ошибка получения преподавателя"));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

// === Обновить предмет преподавателя ===
export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.put(`${REACT_APP_BASE_URL}/update-subject`, { teacherId, teachSubject }, {
      headers: { 'Content-Type': 'application/json' },
    });
    dispatch(postDone());
  } catch (error) {
    dispatch(getError(error));
  }
};
