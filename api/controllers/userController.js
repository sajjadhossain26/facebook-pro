import User from "../models/User.js";
import createError from "../utility/createError.js";
import { isEmail, isMobile } from "../utility/Vailidate.js";
import { hashPassword, passwordVerify } from "../utility/hash.js";
import { mathRandom } from "../utility/math.js";
import {
  accountActivation,
  sendPasswordForgotLink,
} from "../utility/sendMail.js";
import { createToken, tokenVerify } from "../utility/token.js";
import { sendOTP } from "../utility/sendSMS.js";

/**
 * @access public
 * @method POST
 * @route api/user/register
 */

export const register = async (req, res, next) => {
  try {
    //  get form data
    const {
      first_name,
      sur_name,
      auth,
      password,
      birth_date,
      birth_month,
      birth_year,
      gender,
    } = req.body;

    // validation
    if (!first_name || !sur_name || !auth || !password || !gender) {
      next(createError(400, "All fields are required"));
    }
    let mobileData = null;
    let emailData = null;

    if (isEmail(auth)) {
      emailData = auth;

      const emailCheck = await User.findOne({ email: auth });
      if (emailCheck) {
        return next(createError(400, "Email already exist"));
      }
    } else if (isMobile(auth)) {
      mobileData = auth;
      const mobileCheck = await User.findOne({ mobile: auth });
      if (mobileCheck) {
        return next(createError(400, "Mobile number already exist"));
      }
    } else {
      return next(createError(404, "Invalid email or mobile"));
    }

    // activation code
    const activationCode = mathRandom(10000, 99999);
    // check activation code
    const checkCode = await User.findOne({ access_token: activationCode });
    if (checkCode) {
      activationCode = mathRandom(10000, 99999);
    }
    const user = await User.create({
      first_name,
      sur_name,
      mobile: mobileData,
      email: emailData,
      password: hashPassword(password),
      birth_date,
      birth_month,
      birth_year,
      gender,
      access_token: activationCode,
    });

    if (user) {
      if (emailData) {
        const token = createToken({ id: user._id }, "365d");
        const activationToken = createToken({ id: user._id }, "30d");

        // send activation mail
        accountActivation(user.email, {
          name: user.first_name,
          link: `${
            process.env.APP_URL + ":" + process.env.PORT
          }/api/v1/user/activate/${activationToken}`,
          code: activationCode,
        });

        res
          .status(200)
          .cookie("otp", user.email, {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          })
          .json({
            message: "User created successFul",
            user: user,
            token: token,
          });
      }

      if (mobileData) {
        // send activation otp
        sendOTP(
          user.mobile,
          `Hi ${user.first_name} ${user.sur_name}, Your account activation otp is ${activationCode}`
        );

        res
          .status(200)
          .cookie("otp", user.mobile, {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          })
          .json({
            message: "User created successFul",
            user: user,
          });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @access public
 * @method POST
 * @route api/user/resend-activation
 */

export const resentActivation = async (req, res, next) => {
  const { auth } = req.body;
  let mobileData = null;
  let emailData = null;
  let mobileCheck;
  let emailCheck;

  if (isEmail(auth)) {
    emailData = auth;

    emailCheck = await User.findOne({ email: auth });
    if (!emailCheck) {
      return next(createError(400, "User not found by email"));
    }
    if (emailCheck.isActivate) {
      return next(createError(404, "User already activated"));
    }
  } else if (isMobile(auth)) {
    mobileData = auth;
    mobileCheck = await User.findOne({ mobile: auth });
    if (!mobileCheck) {
      return next(createError(400, "user not found by mobile"));
    }
    if (mobileCheck.isActivate) {
      return next(createError(404, "User already activated"));
    }
  } else {
    return next(createError(404, "Invalid email or mobile"));
  }

  try {
    // activation code
    const activationCode = mathRandom(10000, 99999);
    // check activation code
    const checkCode = await User.findOne({ access_token: activationCode });
    if (checkCode) {
      activationCode = mathRandom(10000, 99999);
    }

    // New Otp send by mobile
    if (mobileData) {
      // send activation otp
      sendOTP(
        mobileCheck.mobile,
        `Hi ${mobileCheck.first_name} ${mobileCheck.sur_name}, Your account activation otp is ${activationCode}`
      );

      // Update new link
      await User.findByIdAndUpdate(mobileCheck._id, {
        access_token: activationCode,
      });

      res
        .status(200)
        .cookie("otp", mobileCheck.mobile, {
          expires: new Date(Date.now() + 1000 * 60 * 15),
        })
        .json({
          message: "OTP code has been send on mobile",
          user: mobileCheck,
        });
    }

    // New Otp send by email

    if (emailCheck) {
      const activationToken = createToken({ id: emailCheck._id }, "30d");

      // Update new link
      await User.findByIdAndUpdate(emailCheck._id, {
        access_token: activationCode,
      });

      // send activation mail
      accountActivation(emailCheck.email, {
        name: emailCheck.first_name,
        link: `${
          process.env.APP_URL + ":" + process.env.PORT
        }/api/v1/user/activate/${activationToken}`,
        code: activationCode,
      });

      res
        .status(200)
        .cookie("otp", emailCheck.email, {
          expires: new Date(Date.now() + 1000 * 60 * 15),
        })
        .json({
          message: "Activation link has been send",
        });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @access public
 * @method POST
 * @route api/user/login
 */

export const login = async (req, res, next) => {
  try {
    const { auth, password } = req.body;

    if (!auth || !password) {
      next(createError(400, "All fields are required!"));
    }
    if (isEmail(auth)) {
      const loginUser = await User.findOne({ email: auth });

      if (!loginUser) {
        next(createError(400, "Email User not found"));
      } else {
        if (!passwordVerify(password, loginUser.password)) {
          next(createError(400, "Wrong password"));
        } else {
          const token = createToken({ id: loginUser._id }, "365d");
          res.cookie("authToken", token).status(200).json({
            message: "User Login successFul",
            user: loginUser,
            token: token,
          });
        }
      }
    } else if (isMobile(auth)) {
      const loginUser = await User.findOne({ mobile: auth });

      if (!loginUser) {
        next(createError(400, "Mobile User not found"));
      } else {
        if (!passwordVerify(password, loginUser.password)) {
          next(createError(400, "Wrong password"));
        } else {
          const token = createToken({ id: loginUser._id }, "365d");
          res.cookie("authToken", token).status(200).json({
            message: "User Login successFul",
            user: loginUser,
            token: token,
          });
        }
      }
    } else {
      next(createError(400, "Login invalid"));
    }
  } catch (error) {
    next("error");
  }
};

/**
 * @access public
 * @method GET
 * @route api/user/me
 */

export const loggedInUser = async (req, res, next) => {
  try {
    const auth_token = req.headers.authorization;
    if (!auth_token) {
      next(createError(400, "Token not found"));
    }
    if (auth_token) {
      const token = auth_token.split(" ")[1];
      const user = tokenVerify(token);
      if (!user) {
        next(createError(400, "Invalid token"));
      }
      if (user) {
        const loggedInUser = await User.findById(user.id);
        if (!loggedInUser) {
          next(createError(400, "User not found"));
        } else {
          res.status(200).json({
            message: "User data stable",
            user: loggedInUser,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Account activation by email
 */
export const activateAccount = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      next(createError(400, "Invalid activation url"));
    } else {
      const tokenData = tokenVerify(token);

      if (!tokenData) {
        next(createError(400, "Activation url invalid, try again"));
      }
      if (tokenData) {
        const accountStatus = await User.findById(tokenData.id);

        if (accountStatus.isActivate == true) {
          next(createError(400, "Account already activate"));
        } else {
          await User.findByIdAndUpdate(tokenData.id, {
            isActivate: true,
            access_token: "",
          });
          res.status(200).json({
            message: "Account activation successful",
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Account activate by code
 */

export const accountActivateByCode = async (req, res, next) => {
  try {
    const { code, email } = req.body;
    const user = await User.findOne().or([{ email: email }, { mobile: email }]);
    if (!user) {
      next(createError(400, "Activation user not found"));
    }
    if (user.isActivate == true) {
      next(createError(400, "User already activated by email"));
    }

    if (user.access_token != code) {
      next(createError(404, "User code invalid"));
    } else {
      await User.findByIdAndUpdate(user.id, {
        isActivate: true,
        access_token: "",
      });
      res.status(200).json({
        message: "User activated successful",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password link
 */

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      next(createError(404, "User not found"));
    }
    if (user) {
      const passwordResetToken = createToken({ id: user._id }, "1m");

      // activation code
      const activationCode = mathRandom(10000, 99999);
      // check activation code
      const checkCode = await User.findOne({ access_token: activationCode });
      if (checkCode) {
        activationCode = mathRandom(10000, 99999);
      }

      // Send password reset mail
      sendPasswordForgotLink(user.email, {
        name: user.first_name,
        link: `${
          process.env.APP_URL + ":" + process.env.PORT
        }/api/v1/user/forgot-password/${passwordResetToken}`,
        code: activationCode,
      });

      await User.findByIdAndUpdate(user._id, {
        access_token: activationCode,
      });

      res.status(200).json({
        message: "Password reset link has send to your email",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Password reset
 */

export const passwordResetAction = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      next(createError(400, "Invalid Password reset url"));
    } else {
      const tokenData = tokenVerify(token);

      if (!tokenData) {
        next(createError(400, "Invalid password reset token"));
      }
      if (tokenData) {
        const user = await User.findById(tokenData.id);
        if (!user) {
          next(createError(400, "Invalid user id"));
        }
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            password: hashPassword(password),
            access_token: "",
          });
        }
        res.status(200).json({
          message: "Your password changed",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Find account
 */

export const findAccount = async (req, res, next) => {
  const { auth } = req.body;

  let mobileData = null;
  let emailData = null;

  if (isEmail(auth)) {
    emailData = auth;

    const emailCheck = await User.findOne({ email: auth });
    if (!emailCheck) {
      return next(createError(400, "Email user not found"));
    } else {
      res
        .status(200)
        .cookie(
          "findUser",
          JSON.stringify({
            name: emailCheck.first_name,
            email: emailCheck.email,
            photo: emailCheck.profile_photo,
          }),
          {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          }
        )
        .json({
          user: emailCheck,
        });
    }
  } else if (isMobile(auth)) {
    mobileData = auth;
    const mobileCheck = await User.findOne({ mobile: auth });
    if (!mobileCheck) {
      return next(createError(400, "Mobile user not found"));
    } else {
      res
        .status(200)
        .cookie(
          "findUser",
          JSON.stringify({
            name: mobileCheck.first_name,
            mobile: mobileCheck.mobile,
            photo: mobileCheck.profile_photo,
          }),
          {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          }
        )
        .json({
          user: mobileCheck,
        });
    }
  } else {
    return next(createError(404, "Invalid email or mobile"));
  }
};

/**
 * Send password reset otp / link
 */

export const sendPasswordResetOTP = async (req, res, next) => {
  const { auth } = req.body;

  try {
    let mobileData = null;
    let emailData = null;
    let mobileCheck;
    let emailCheck;

    if (isEmail(auth)) {
      emailData = auth;

      emailCheck = await User.findOne({ email: auth });
    } else if (isMobile(auth)) {
      mobileData = auth;
      mobileCheck = await User.findOne({ mobile: auth });
    } else {
      return next(createError(404, "Invalid email or mobile"));
    }

    // activation code
    const activationCode = mathRandom(10000, 99999);
    // check activation code
    const checkCode = await User.findOne({ access_token: activationCode });
    if (checkCode) {
      activationCode = mathRandom(10000, 99999);
    }

    // New Otp send by mobile
    if (mobileData) {
      // send activation otp
      sendOTP(
        mobileCheck.mobile,
        `Hi ${mobileCheck.first_name} ${mobileCheck.sur_name}, Your account reset confirmation otp is ${activationCode}`
      );

      // Update new link
      await User.findByIdAndUpdate(mobileCheck._id, {
        access_token: activationCode,
      });

      res
        .status(200)
        .cookie("otp", mobileCheck.mobile, {
          expires: new Date(Date.now() + 1000 * 60 * 15),
        })
        .json({
          message: "OTP code has been send on mobile",
          user: mobileCheck,
        });
    }

    // New Otp send by email

    if (emailCheck) {
      const activationToken = createToken({ id: emailCheck._id }, "30d");

      // Update new link
      await User.findByIdAndUpdate(emailCheck._id, {
        access_token: activationCode,
      });

      // send activation mail
      sendPasswordForgotLink(emailCheck.email, {
        name: emailCheck.first_name,
        link: `${
          process.env.APP_URL + ":" + process.env.PORT
        }/api/v1/user/activate/${activationToken}`,
        code: activationCode,
      });

      res
        .status(200)
        .cookie("otp", emailCheck.email, {
          expires: new Date(Date.now() + 1000 * 60 * 15),
        })
        .json({
          message: "Activation link has been send",
        });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Check password reset otp
 */

export const checkPasswordResetOTP = async (req, res, next) => {
  try {
    const { code, auth } = req.body;

    if (isEmail(auth)) {
      const userData = await User.findOne({ email: auth });
      if (!userData) {
        return next(createError(400, "Invalid Email User"));
      }
      if (userData.access_token != code) {
        return next(createError(400, "Invalid OTP Code"));
      } else {
        return res
          .cookie("cpid", userData._id.toString(), {
            expires: new Date(Date.now() + 1000 * 60 * 10),
          })
          .cookie("cpcode", code, {
            expires: new Date(Date.now() + 1000 * 60 * 10),
          })
          .status(200)
          .json({ message: "You can change password" });
      }
    } else if (isMobile(auth)) {
      const userData = await User.findOne({ mobile: auth });
      if (!userData) {
        return next(createError(400, "Invalid Mobile User"));
      }
      if (userData.access_token != code) {
        return next(createError(400, "Invalid OTP Code"));
      } else {
        return res
          .cookie("cpid", userData._id.toString(), {
            expires: new Date(Date.now() + 1000 * 60 * 10),
          })
          .cookie("cpcode", code, {
            expires: new Date(Date.now() + 1000 * 60 * 10),
          })
          .status(200)
          .json({ message: "You can change password" });
      }
    } else {
      return next(createError(404, "Invalid email or mobile"));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Password reset
 */
export const passwordReset = async (req, res, next) => {
  try {
    const { id, password, code } = req.body;
    const userData = await User.findOne().and([
      { _id: id },
      { access_token: code },
    ]);
    if (!userData) {
      return next(createError(400, "Password change request failed"));
    }
    if (userData) {
      await User.findByIdAndUpdate(id, {
        password: hashPassword(password),
        access_token: null,
      });
      return res
        .clearCookie("cpcode")
        .clearCookie("cpid")
        .clearCookie("otp")
        .clearCookie("findUser")
        .status(200)
        .json({
          message: "Password changed successfully",
        });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @access public
 * @method POST
 * @route api/user/resend-password reset
 */

export const resendPasswordReset = async (req, res, next) => {
  try {
    // activation code
    const activationCode = mathRandom(10000, 99999);
    // check activation code
    const checkCode = await User.findOne({ access_token: activationCode });
    if (checkCode) {
      activationCode = mathRandom(10000, 99999);
    }
    const { auth } = req.body;
    let mobileCheck;
    let emailCheck;

    if (isEmail(auth)) {
      emailCheck = await User.findOne({ email: auth });
      if (!emailCheck) {
        return next(createError(400, "User not found by email"));
      }
      // New Otp send by email

      if (emailCheck) {
        const activationToken = createToken({ id: emailCheck._id }, "30d");

        // Update new link
        await User.findByIdAndUpdate(emailCheck._id, {
          access_token: activationCode,
        });

        // send activation mail
        sendPasswordForgotLink(emailCheck.email, {
          name: emailCheck.first_name,
          link: `${
            process.env.APP_URL + ":" + process.env.PORT
          }/api/v1/user/activate/${activationToken}`,
          code: activationCode,
        });

        res
          .status(200)
          .cookie("otp", emailCheck.email, {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          })
          .json({
            message: "Password Reset Confirmation OTP Send",
          });
      }
    } else if (isMobile(auth)) {
      mobileCheck = await User.findOne({ mobile: auth });
      if (!mobileCheck) {
        return next(createError(400, "user not found by mobile"));
      }
      // New Otp send by mobile
      if (mobileData) {
        // send activation otp
        sendOTP(
          mobileCheck.mobile,
          `Hi ${mobileCheck.first_name} ${mobileCheck.sur_name}, Your Password Reset Confirmation OTP Is ${activationCode}`
        );

        // Update new link
        await User.findByIdAndUpdate(mobileCheck._id, {
          access_token: activationCode,
        });

        res
          .status(200)
          .cookie("otp", mobileCheck.mobile, {
            expires: new Date(Date.now() + 1000 * 60 * 15),
          })
          .json({
            message: "OTP code has been send on mobile",
            user: mobileCheck,
          });
      }
    } else {
      return next(createError(404, "Invalid email or mobile"));
    }
  } catch (error) {
    next(error);
  }
};
