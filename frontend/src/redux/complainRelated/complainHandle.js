import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './complainSlice';

const REACT_APP_BASE_URL = "http://localhost:5001/api"; 

// Получить все жалобы по школе
export const getAllComplains = (schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/complains/school/${schoolId}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
    }
};

// Удалить одну жалобу
export const deleteComplain = (id, schoolId) => async (dispatch) => {
    try {
        await axios.delete(`${REACT_APP_BASE_URL}/complains/${id}`);
        dispatch(getAllComplains(schoolId)); // Обновляем список
    } catch (error) {
        console.error("Ошибка при удалении жалобы:", error);
        dispatch(getError(error.response?.data?.message || error.message));
    }
};
