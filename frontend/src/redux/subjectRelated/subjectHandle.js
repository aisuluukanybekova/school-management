// frontend/src/redux/subjectRelated/subjectHandle.js

import axios from 'axios';
import { getRequest, getSuccess, getFailed, getError } from './subjectSlice';

const BASE_URL = "http://localhost:5001/api/subjects";

// === Получить все предметы по школе ===
export const getAllSubjects = (schoolId) => async (dispatch) => {
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

// === Получить предметы по классу ===
export const getSubjectsByClass = (classId) => async (dispatch) => {
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
