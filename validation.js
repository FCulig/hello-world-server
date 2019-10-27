const Joi = require("@hapi/joi");

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string().required()
    });

    //return Joi.validate(data, schema);
    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string().required()
    });

    return schema.validate(data);
};

const articleValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        shortDescription: Joi.string.required(),
        article: Joi.string().required(),
        authorId: Joi.string().required()
    });

    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.articleValidation = articleValidation;