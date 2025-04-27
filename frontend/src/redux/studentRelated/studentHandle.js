// frontend/src/redux/studentRelated/studentHandle.js

import axios from 'axios';
import {
  getRequest,
  getSuccess,
  getFailed,
  getError,
  stuffDone
} from './studentSlice';

const BASE_URL = "http://localhost:5001/api/students";

// === Получить всех студентов по ШКОЛЕ ===
export const getAllStudents = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${BASE_URL}/school/${schoolId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error.message || "Ошибка сети"));
  }
};

// === Получить студентов по КЛАССУ ===
export const getStudentsByClass = (classId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.get(`${BASE_URL}/class/${classId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error.message || "Ошибка сети"));
  }
};

// === Обновить данные студента ===
export const updateStudentFields = (studentId, fields) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.put(`http://localhost:5001/api/student/${studentId}`, fields, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(stuffDone());
    }
  } catch (error) {
    dispatch(getError(error.message || "Ошибка сети"));
  }
};

// === Удалить данные студента (очистить поля) ===
export const removeStuff = (studentId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const result = await axios.put(`http://localhost:5001/api/student/clear/${studentId}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(stuffDone());
    }
  } catch (error) {
    dispatch(getError(error.message || "Ошибка сети"));
  }
};
