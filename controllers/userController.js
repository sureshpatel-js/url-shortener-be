const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
const { validateClientAdminSignUp } = require("../validate/validateUser");
const { generateOtpAndTime } = require("../utils/auth/otp");
const AppError = require("../utils/errorHandling/AppError");
const sendMail = require("../utils/nodemailer/nodemailer");

const { UNABLE_TO_SEND_OTP,
    UNABLE_TO_CREATE_USER,
    USER_ALREADY_EXIST,
} = require("../constants/errorMessageConstants");

const { CLIENT_ADMIN, CLIENT, MONTHLY_PLAN_DAYS, MONTHLY_PLAN_LINKS } = require("../constants/constants");

exports.clientAdminSignUp = async (req, res, next) => {
    console.log(req.body);
    const value = await validateClientAdminSignUp(req.body);
    if (!value.status) {
        return next(new AppError(400, value.message));
    }
    //Step 1 Find user.
    const findUser = await UserModel.findOne({ email: req.body.email });
    //If user exist and email is verified, then return to login page.
    if (findUser && findUser.email_verified === true) {
        return next(new AppError(409, USER_ALREADY_EXIST));
    }

    const session = await mongoose.startSession();
    const link_available_expire_date = new Date();
    link_available_expire_date.setDate(link_available_expire_date.getDate() + 30);
    try {
        session.startTransaction();
        const { first_name, email } = req.body;
        const { otp, hashedOtp, otpCreatedAt } = await generateOtpAndTime();

        let newUser;
        //If user does not exist create one and send otp
        if (!findUser) {
            newUser = await UserModel.create([{
                first_name,
                email,
                hashed_otp: hashedOtp,
                otp_created_at: otpCreatedAt,
                email_verified: false,
                user_type: CLIENT_ADMIN,
                user_domain: CLIENT,
                link_available_expire_date,
                link_available: 10
            }], { session });
        } else if (findUser && findUser.email_verified === false) {
            newUser = await UserModel.findByIdAndUpdate(findUser._id, {
                first_name,
                hashed_otp: hashedOtp,
                otp_created_at: otpCreatedAt,
                link_available_expire_date,
                link_available: 10
            },
                { session }
            );
        }

        const sendMailStatus = await sendMail(
            email,
            "OTP Verification.",
            ``,
            `Hi ${first_name}, please use this OTP to verify your email address.</br> <b>${otp}</b> `,
        );

        if (!sendMailStatus) {
            return next(new AppError(500, UNABLE_TO_SEND_OTP));
        }

        await session.commitTransaction();

        res.status(201).json({
            status: "success",
            data: {
                message: `Check your email: ${email} for OTP.`,
                user: {
                    first_name,
                    email,
                },
            }
        });

    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        return next(new AppError(500, UNABLE_TO_CREATE_USER));
    }
    session.endSession();
}



exports.getMyObj = async (req, res, next) => {
    // const { first_name, user_type, email  } = req.user;
    try {
        res.status(200).json({
            status: "success",
            data: {
                user: req.user
            }
        })
    } catch (error) {
        console.log(error);
        return next(new AppError(500, error));
    }

}


//BUY PLAN

exports.buyPlane = async (req, res, next) => {
    const plan = "monthly";
    const link_available_expire_date = new Date();
    link_available_expire_date.setDate(link_available_expire_date.getDate() + 30);
    try {
        const user = await UserModel.findById(req.user._id);
        if (plan === "monthly") {
            if (new Date(user.link_available_expire_date) < new Date()) {
                const today = new Date();
                user.link_available_expire_date = today.setDate(today.getDate() + MONTHLY_PLAN_DAYS);
            } else {
                user.link_available_expire_date = new Date(user.link_available_expire_date).setDate(new Date(user.link_available_expire_date).getDate() + MONTHLY_PLAN_DAYS);
                user.link_available = user.link_available + MONTHLY_PLAN_LINKS;
            }
        }
        await user.save();
        res.status(200).json({
            status: "success",
            data: {
                message: "Payment success."
            }
        })
    } catch (error) {
        console.log(error);
        return next(new AppError(500, error));
    }
}
