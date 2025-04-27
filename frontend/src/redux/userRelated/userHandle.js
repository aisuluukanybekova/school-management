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
    const endpoint = role === 'Teacher' ? 'teachers/login' : `${role.toLowerCase()}Login`;
    const { data } = await request('post', `${BASE_URL}/${endpoint}`, fields);

    if (data.role || data.schoolName) {
      dispatch(authSuccess(data));
    } else {
      dispatch(authFailed(data.message));
    }
  } catch (error) {
    dispatch(authError(error));
  }
};

// === REGISTER ===
export const registerUser = (fields, role) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const endpoint = role === 'Teacher' ? 'teachers/register' : `${role.toLowerCase()}Reg`;
    const { data } = await request('post', `${BASE_URL}/${endpoint}`, fields);

    if (data.schoolName) {
      dispatch(authSuccess(data));
    } else if (data.school) {
      dispatch(stuffAdded(data));
    } else {
      dispatch(authFailed(data.message));
    }
  } catch (error) {
    dispatch(authError(error));
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
    const { data } = await request('get', `${BASE_URL}/${address}/${id}`);
    dispatch(doneSuccess(data));
  } catch (error) {
    dispatch(getError(error));
  }
};

// === DELETE USER ===
export const deleteUser = (id, address) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await request('delete', `${BASE_URL}/${address}/${id}`);
    data.message ? dispatch(getFailed(data.message)) : dispatch(getDeleteSuccess());
  } catch (error) {
    dispatch(getError(error));
  }
};

// === UPDATE USER ===
export const updateUser = (fields, id, address) => async (dispatch) => {
  dispatch(getRequest());
  try {
    const { data } = await request('put', `${BASE_URL}/${address}/${id}`, fields);
    if (data.schoolName) {
      dispatch(authSuccess(data));
    } else {
      dispatch(doneSuccess(data));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

// === ADD STAFF (STUFF) ===
export const addStuff = (fields, address) => async (dispatch) => {
  dispatch(authRequest());
  try {
    const url = address === 'Subject' 
      ? `${BASE_URL}/subjects/` 
      : `${BASE_URL}/${address}Create`;
    
    const { data } = await request('post', url, fields);

    data.message ? dispatch(authFailed(data.message)) : dispatch(stuffAdded(data));
  } catch (error) {
    dispatch(authError(error));
  }
};
