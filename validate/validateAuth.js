const Joi = require("joi");

exports.validateSetPasswordBody = async (body) => {
    const schema = Joi.object({
        otp: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ["com", "net"] },
            }),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

exports.validateLogIn = async (body) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ["com", "net"] },
            }),
        password: Joi.string().required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};
exports.validatePowertBiLogIn = async (body) => {
    const schema = Joi.object({
        power_bi_user_id: Joi.string().required(),
        password: Joi.string().required(),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

exports.validateGenerateOtpBody = async (body) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: { allow: ["com", "net"] },
            }),
    });
    try {
        const value = await schema.validateAsync(body);
        return { status: true, body: value };
    } catch (error) {
        return { status: false, message: error.message };
    }
};
