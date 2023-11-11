import Joi from 'joi';

export const authReqSchemas = {
  validateSecAnswer: Joi.object({
    username: Joi.string().required(),
    yob: Joi.string().required(),
    color: Joi.string(),
    street: Joi.string(),
  }),
};

export const registerReqSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
  firstName: Joi.string().required(),
  lastInit: Joi.string().length(1).required(),
});

export const loginReqSchema = Joi.object({
  username: Joi.string().max(16).required(),
  password: Joi.string().min(5).max(32).required(),
});
