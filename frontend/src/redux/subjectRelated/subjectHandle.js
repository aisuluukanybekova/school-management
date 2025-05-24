import axios from 'axios';
import {
  getRequest, getSuccess, getFailed, getError,
} from './subjectSlice';

const BASE_URL = 'http://localhost:5001/api/subjects';

// Получить все предметы по школе
export const getAllSubjects = (schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const res = await axios.get(`${BASE_URL}/school/${schoolId}`);
    if (res.data.message) {
      dispatch(getFailed(res.data.message));
    } else {
      dispatch(getSuccess(res.data));
    }
  } catch (err) {
    dispatch(getError(err.message || 'Ошибка загрузки предметов'));
  }
};

// Добавить предмет
export const addSubject = (payload) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.post(`${BASE_URL}`, payload);
    dispatch(getAllSubjects(payload.school));
  } catch (err) {
    dispatch(getError(err.message || 'Ошибка при добавлении предмета'));
  }
};

// Обновить предмет
export const updateSubject = (id, data) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.put(`${BASE_URL}/${id}`, data);
    dispatch(getAllSubjects(data.school));
  } catch (err) {
    dispatch(getError(err.message || 'Ошибка при обновлении предмета'));
  }
};

// Удалить предмет
export const deleteSubject = (id, schoolId) => async (dispatch) => {
  dispatch(getRequest());
  try {
    await axios.delete(`${BASE_URL}/${id}`);
    dispatch(getAllSubjects(schoolId));
  } catch (err) {
    dispatch(getError(err.message || 'Ошибка при удалении предмета'));
  }
};
