/**
 * Create auth reducer
 */

import {
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  LOG_OUT,
  REGISTER_FAILED,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  TOKEN_USER_FAILED,
  TOKEN_USER_SUCCESS,
} from "./actionType";
import initialState from "./initialState";

const AuthReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        message: payload,
      };

    case REGISTER_FAILED:
      return {
        ...state,
        loading: false,
        message: payload,
      };

    case LOGIN_FAILED:
      return {
        ...state,
        user: null,
        loginState: false,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        user: payload,
        loginState: true,
      };

    case TOKEN_USER_SUCCESS:
      return {
        ...state,
        user: payload,
        loginState: true,
      };

    case TOKEN_USER_FAILED:
      return {
        ...state,
        user: null,
        loginState: false,
      };
    case LOG_OUT:
      return {
        ...state,
        user: null,
        loginState: false,
      };

    default:
      return state;
  }
};

export default AuthReducer;
