const UserModel = require("../models/userModel");

const AppError = require("../utils/errorHandling/AppError");
const { validateSetPasswordBody,
    validateLogIn,
    validateGenerateOtpBody
} = require("../validate/validateAuth");
const { checkOtp } = require("../utils/auth/otp");
const bcrypt = require("bcrypt");
const { UNABLE_TO_CREATE_PASSWORD,
    YOU_HAVE_NOT_CREATED_PASSWORD_YET,
    USER_BELONGS_TO_THIS_TOKEN_DELETED,
    YOU_CHANGED_PASSWORD_PLEASE_LOGIN_AGAIN,
    INTERNAL_SERVER_ERROR,
    YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACTION,
    UNABLE_TO_SEND_OTP
} = require("../constants/errorMessageConstants");
const { PASSWORD_UPDATED_SUCCESSFULLY } = require("../constants/successMessageConstants");
const { getJwt, verifyJwt } = require("../utils/auth/jwt");
const { checkPassword } = require("../utils/auth/password");
const { generateOtpAndTime } = require("../utils/auth/otp");
const sendMail = require("../utils/nodemailer/nodemailer");

exports.setPassword = async (req, res, next) => {
    const value = await validateSetPasswordBody(req.body);
    if (!value.status) {
        next(new AppError(400, value.message));
        return;
    }
    const { email, password, otp } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            next(new AppError(404, `User does not exist with this ${email} email.`));
            return;
        }
        const { otp_created_at, hashed_otp } = user;
        const { status, message } = await checkOtp({
            otp,
            hashedOtp: hashed_otp,
            otpCreatedAt: otp_created_at,
        });
        if (!status) {
            next(new AppError(404, message));
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const password_updated_at = new Date().getTime();
        await UserModel.findByIdAndUpdate(user._id, {
            hashed_password: hashPassword,
            password_updated_at,
            hashed_otp: null,
            otp_created_at: null,
            email_verified: true
        });

        const tokenObj = await getJwt(user._id);
        if (!tokenObj.status) {
            return next(new AppError(500, tokenObj.message));

        }
        const { token } = tokenObj;

        res.status(201).json({
            status: "success",
            data: {
                message: PASSWORD_UPDATED_SUCCESSFULLY,
                token,
            }
        });
    } catch (error) {
        console.log(error);
        next(new AppError(500, UNABLE_TO_CREATE_PASSWORD));
    }
};

exports.logIn = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const value = await validateLogIn(req.body);
        if (!value.status) {
            next(new AppError(400, value.message));
            return;
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return next(new AppError(404, `User does not exist with this ${email} email.`));
        }
        if (!user.hashed_password) {
            return next(new AppError(400, YOU_HAVE_NOT_CREATED_PASSWORD_YET));
        }
        const { status, message } = await checkPassword({
            hashedPassword: user.hashed_password,
            password,
        });
        if (!status) {
            return next(new AppError(401, message));

        }
        const tokenObj = await getJwt(user._id);
        if (!tokenObj.status) {
            return next(new AppError(500, tokenObj.message));

        }
        const { token } = tokenObj;
        // res.cookie("authToken", token, { maxAge: 26000000 });
        // const brandIdsArray = user.brand_array.map(el => {
        //     return el.brand_id;
        // })
        res.status(200).json({
            status: "success",
            data: {
                message: "You are logged in successfully.",
                token,
                user,
            }
        });
    } catch (error) {
        console.log(error)
        return next(new AppError(500, INTERNAL_SERVER_ERROR));
    }
};


exports.generateOtp = async (req, res, next) => {
    const { email } = req.body;
    const value = await validateGenerateOtpBody(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));

    }
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return next(new AppError(404, `User does not exist with this ${email} email.`));

        }
        const { otp, hashedOtp, otpCreatedAt } = await generateOtpAndTime();
        console.log(otp, hashedOtp, otpCreatedAt)
        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            hashed_otp: hashedOtp,
            otp_created_at: otpCreatedAt,
        });
        const sendMailStatus = await sendMail(
            email,
            "OTP Verification.",
            ``,
            `Hi ${user.first_name}, please use this OTP to verify your email address.</br> <b>${otp}</b> `,
        );
        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_OTP));

        }

        res.status(200).json({
            status: "success",
            data: {
                message: `Check your email: ${updatedUser.email} for OTP.`,
                email: updatedUser.email,
            }
        });
    } catch (error) {
        console.log(error)
        return next(new AppError(500, INTERNAL_SERVER_ERROR));
    }
};

exports.protectRoute = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return next(new AppError(401, "You have been logged out, please login again."));
    }
    const value = await verifyJwt(token);
    if (!value.status) {
        return next(new AppError(401, value.message));

    }
    const { id, iat, exp } = value.decoded;
    let user;
    try {
        user = await UserModel.findById(id);
        if (!user) {
            return next(new AppError(404, USER_BELONGS_TO_THIS_TOKEN_DELETED));
        }
        const token_createdAt_time = iat * 1000;
        const { password_updated_at } = user;
        const result = token_createdAt_time > password_updated_at;
        if (!result) {
            return next(new AppError(401, YOU_CHANGED_PASSWORD_PLEASE_LOGIN_AGAIN));

        }
    } catch (error) {
        console.log(error);
        return next(new AppError(500, INTERNAL_SERVER_ERROR));

    }
    req.user = user;
    next();
};

exports.restrictTo = (...userTypes) => {
    return (req, res, next) => {
        if (!userTypes.includes(req.user.user_type)) {
            return next(new AppError(403, YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACTION))
        }
        next();
    }
}