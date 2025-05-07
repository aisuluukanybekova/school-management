import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest
} from './sclassSlice';

const REACT_APP_BASE_URL = "http://localhost:5001/api";

// === Получить все классы ===
export const getAllSclasses = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/classes/school/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// === Получить всех учеников класса ===
export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/students/class/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// === Получить детали класса ===
export const getClassDetails = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/classes/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// === Получить все предметы класса ===
export const getSubjectList = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/subjects/class/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// === Получить предметы с учителями по классу ===
export const getSubjectsWithTeachers = (classId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.get(`${REACT_APP_BASE_URL}/teacherSubjectClass/assigned/${classId}`);
        if (res.data.message) {
            dispatch(getFailed(res.data.message));
        } else {
            dispatch(getSubjectsSuccess(res.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};


// === Получить свободные предметы для учителя ===
export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/subjects/free/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// === Получить детали предмета ===
export const getSubjectDetails = (id) => async (dispatch) => {
    dispatch(getSubDetailsRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/subjects/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};
