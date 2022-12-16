import express from "express";
import {
  loggedInUser,
  login,
  register,
  activateAccount,
  accountActivateByCode,
  forgotPassword,
  passwordResetAction,
  resentActivation,
  findAccount,
  sendPasswordResetOTP,
  checkPasswordResetOTP,
  passwordReset,
  resendPasswordReset,
} from "../controllers/userController.js";

const router = express.Router();

// user auth route
router.post("/login", login);
router.post("/register", register);
router.get("/me", loggedInUser);
router.get("/activate/:token", activateAccount);
router.post("/code-activate", accountActivateByCode);
router.post("/resend-activate", resentActivation);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/:token", passwordResetAction);
router.post("/find-account", findAccount);
router.post("/send-password-reset", sendPasswordResetOTP);
router.post("/check-password-reset-otp", checkPasswordResetOTP);
router.post("/user-password-reset", passwordReset);
router.post("/resend-password-reset", resendPasswordReset);

export default router;
