import axios from 'axios';
import {
  authRequest,
  stuffAdded,
  authSuccess,
  authFailed,
  authError,
  authLogout,
  doneSuccess,
  getDeleteSuccess,
  getRequest,
  getFailed,
  getError,
} from './userSlice';

const BASE_URL = 'http://localhost:5001/api';

// === Универсальный запрос ===
const request = async (method, url, data = {}, headers = {}) => {
  return axios({ method, url, data, headers: { 'Content-Type': 'application/json', ...headers } });
};

// === LOGIN ===
export const loginUser = (fields, role) => async (dispatch) => {
  dispatch(authRequest());
  try {
    let endpoint = '';
    if (role === 'Teacher') endpoint = 'teachers/login';
    else if (role === 'Student') endpoint = 'students/login';
    else if (role === 'Admin') endpoint = 'admins/login';
    else endpoint = `${role.toLowerCase()}/login`;

    const { data } = await axios.post(`${BASE_URL}/${endpoint}`, fields);

    if (!data || !data._id) {
      dispatch(authFailed(data.message || 'Ошибка авторизации'));
      return;
    }

    const userPayload = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: role,
      schoolId: data.schoolId || (data.school ? data.school._id : null),
      school: data.school || null,
      sclassName: data.sclassName || null, //  важное добавление
      teachSclass: data.teachSclass || null,
      teachSubject: data.teachSubject || null,
      homeroomFor: data.homeroomFor || null
    };

    console.log(' Student login:', userPayload); // можно убрать позже

    dispatch(authSuccess(userPayload));
  } catch (error) {
    dispatch(authError(error?.response?.data?.message || error.message));
  }
};


// === REGISTER ===
export const registerUser = (fields, role) => async (dispatch) => {
  dispatch(authRequest());
  try {
    let endpoint = '';
    if (role === 'Teacher') endpoint = 'teachers/register';
    else if (role === 'Student') endpoint = 'students/register';
    else if (role === 'Admin') endpoint = 'admins/register';
    else endpoint = `${role.toLowerCase()}/register`;

    const { data } = await request('post', `${BASE_URL}/${endpoint}`, fields);

    if (role === 'Admin') {
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        schoolId: data.schoolId || (data.school ? data.school._id : null),
        school: data.school || null,
      };
      dispatch(authSuccess(userPayload));
    } else {
      dispatch(stuffAdded(data));
    }
  } catch (error) {
    dispatch(authError(error?.response?.data?.message || error.message));
  }
};

// === LOGOUT ===
export const logoutUser = () => (dispatch) => {
  dispatch(authLogout());
};

// === GET USER DETAILS ===
export const getUserDetails = (id, address) => async (dispatch) => {
  dispatch(getRequest());
  try {
    // 🔧 Автоматически делаем address во множественном числе, если это роль
    const endpoint = address.toLowerCase().endsWith('s') ? address : `${address.toLowerCase()}s`;
    const { data } = await request('get', `${BASE_URL}/${endpoint}/${id}`);
    dispatch(doneSuccess(data));
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === DELETE USER ===
export const deleteUser = (id, address) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await request('delete', `${BASE_URL}/${address}/${id}`);
    data.message ? dispatch(getFailed(data.message)) : dispatch(getDeleteSuccess());
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === UPDATE USER ===
export const updateUser = (fields, id, address) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await request('put', `${BASE_URL}/${address}/${id}`, fields);

    if (data.schoolId || data.schoolName || data.school) {
      const userPayload = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        schoolId: data.schoolId || (data.school ? data.school._id : null),
        school: data.school || null,
      };
      dispatch(authSuccess(userPayload));
    } else {
      dispatch(doneSuccess(data));
    }
  } catch (error) {
    dispatch(getError(error?.response?.data?.message || error.message));
  }
};

// === ADD STAFF / NOTICE / SUBJECT / TEACHER-SUBJECT-CLASS ===
export const addStuff = (fields, address) => async (dispatch) => {
  dispatch(authRequest());
  try {
    let url = '';
    if (address === 'Subject') {
      url = `${BASE_URL}/subjects/`;
    } else if (address === 'notice') {
      url = `${BASE_URL}/notices`;
    } else if (address === 'teacherSubjectClass') {
      url = `${BASE_URL}/teacherSubjectClass`;
    } else {
      url = `${BASE_URL}/${address}`;
    }

    const { data } = await request('post', url, fields);

    data.message ? dispatch(authFailed(data.message)) : dispatch(stuffAdded(data));
  } catch (error) {
    dispatch(authError(error?.response?.data?.message || error.message));
  }
};
