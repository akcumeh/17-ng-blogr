const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    username: Joi.string().min(2).required(),
    password: Joi.string().min(6).required()
});

const signinSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const blogSchema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string().allow(''),
    tags: Joi.string().min(2),
    body: Joi.string().required()
});

const updateBlogSchema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string().allow(''),
    tags: Joi.string().min(2),
    body: Joi.string().required()
}).min(1);

export {
    signupSchema,
    signinSchema,
    blogSchema,
    updateBlogSchema
};