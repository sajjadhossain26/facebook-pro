import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthRedirect = ({ children }) => {
  const { loginState } = useSelector((state) => state.auth);
  return loginState ? children : <Navigate to="/" />;
};

export default AuthRedirect;
