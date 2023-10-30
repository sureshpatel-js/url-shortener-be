const bcrypt = require("bcrypt");

exports.generateOtpAndTime = async () => {
    const otp = Math.floor(Math.random() * 1000000);
    const hashedOtp = await bcrypt.hash(`${otp}`, 4);
    const time = new Date().getTime() + 600000;
    return {
        otp,
        hashedOtp,
        otpCreatedAt: time,
    };
};

exports.checkOtp = async (obj) => {
    const { otp, hashedOtp, otpCreatedAt } = obj;
    const validateTime = new Date().getTime() <= otpCreatedAt;
    if (!validateTime) {
        return {
            status: false,
            message: "OTP expired.",
        };
    }
    const validateOtp = await bcrypt.compare(otp, hashedOtp);
    if (!validateOtp) {
        return {
            status: false,
            message: "Please enter valid OTP.",
        };
    }
    return {
        status: true,
    };
};
