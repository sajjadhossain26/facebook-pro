import axios from "axios";
import createToast from "../../utility/toast";
import { LOADER_START } from "../loader/loaderTypes";
import {
  LOGIN_FAILED,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOG_OUT,
  REGISTER_FAILED,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  TOKEN_USER_FAILED,
  TOKEN_USER_REQUEST,
  TOKEN_USER_SUCCESS,
} from "./actionType";
import Cookies from "js-cookie";

// user register
export const userRegister =
  (data, setInput, e, setRegister, navigate) => async (dispatch) => {
    try {
      dispatch({
        type: REGISTER_REQUEST,
      });
      axios
        .post("/api/v1/user/register", data)
        .then((res) => {
          createToast(res.data.message, "success");
          dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data.message,
          });
          setInput({
            fname: "",
            sname: "",
            auth: "",
            password: "",
            day: "",
            month: "",
            year: "",
            gender: "",
          });
          e.target.reset();
          setRegister(false);
          navigate("/activation/account");
        })
        .catch((error) => {
          createToast(error.response.data.message);

          dispatch({
            type: REGISTER_FAILED,
            payload: error.response.data,
          });
        });
    } catch (error) {
      createToast(error.response.data.message);
      dispatch({
        type: REGISTER_FAILED,
        payload: error.response.data,
      });
    }
  };

// User account activation by otp

export const activationOTP =
  ({ code, email }, navigate, Cookie) =>
  async (dispatch) => {
    try {
      axios
        .post("/api/v1/user/code-activate", { code: code, email: email })
        .then((res) => {
          createToast("Account activation successful", "success");
          Cookie.remove("otp");
          navigate("/");
        })
        .catch((error) => {
          createToast(error.response.data.message);
        });
    } catch (error) {
      createToast(error.response.data.message);
    }
  };

// Resend link
export const resendLink = (email, navigate, Cookie) => async (dispatch) => {
  try {
    axios
      .post("/api/v1/user/resend-activate", { auth: email })
      .then((res) => {
        createToast(res.data.message, "success");
      })
      .catch((error) => {
        createToast(error.response.data.message);
      });
  } catch (error) {
    createToast(error.response.data.message);
  }
};

// Check password reset otp
export const checkPasswordResetCode = (data, navigate) => async (dispatch) => {
  try {
    axios
      .post("/api/v1/user/check-password-reset-otp", {
        auth: data.auth,
        code: data.code,
      })
      .then((res) => {
        createToast(res.data.message, "success");
        navigate("/change-password");
      })
      .catch((error) => {
        createToast(error.response.data.message);
      });
  } catch (error) {
    createToast(error.response.data.message);
  }
};

// Change password
export const changePassword = (data, navigate) => async (dispatch) => {
  try {
    await axios
      .post("/api/v1/user/user-password-reset", {
        id: data.id,
        code: data.code,
        password: data.password,
      })
      .then((res) => {
        createToast(res.data.message, "success");
        navigate("/");
      })
      .catch((error) => {
        createToast(error.response.data.message);
      });
  } catch (error) {
    createToast(error.response.data.message);
  }
};

// User login
export const userLogin = (data, navigate) => async (dispatch) => {
  try {
    dispatch({
      type: LOGIN_REQUEST,
    });
    await axios
      .post("/api/v1/user/login", data)
      .then((res) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: res.data.user,
        });
        dispatch({
          type: LOADER_START,
        });
        createToast(res.data.message, "success");
        navigate("/");
      })
      .catch((error) => {
        dispatch({
          type: LOGIN_FAILED,
        });
        createToast(error.response.data.message);
      });
  } catch (error) {
    createToast(error.response.data.message);
  }
};

// Resend password reset link
export const resendPasswordReset = (data) => async (dispatch) => {
  try {
    await axios
      .post("/api/v1/user/resend-password-reset", { auth: data.auth })
      .then((res) => {
        createToast(res.data.message, "success");
      })
      .catch((error) => {
        createToast(error.response.data.message);
      });
  } catch (error) {
    createToast(error.response.data.message);
  }
};

// Token check for Logged user
export const tokenUser = (data, navigate) => async (dispatch) => {
  const token = Cookies.get("authToken");
  try {
    dispatch({
      type: TOKEN_USER_REQUEST,
    });
    await axios
      .get("/api/v1/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        dispatch({
          type: TOKEN_USER_SUCCESS,
          payload: res.data.user,
        });
        dispatch({
          type: LOADER_START,
        });
      })
      .catch((error) => {
        dispatch({
          type: TOKEN_USER_FAILED,
        });
        dispatch(logOut());
      });
  } catch (error) {
    dispatch(logOut());
    dispatch({
      type: TOKEN_USER_FAILED,
    });
    createToast(error.response.data.message);
  }
};

export const logOut = () => (dispatch) => {
  Cookies.remove("authToken");
  dispatch({
    type: LOG_OUT,
  });
};
