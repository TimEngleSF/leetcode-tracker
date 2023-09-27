import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required().max(10),
  firstName: Joi.string().required().max(10),
  lastInit: Joi.string().required().max(1),
  password: Joi.string().required().max(32),
  secAns: Joi.object({
    color: Joi.string().required(),
    yob: Joi.string().length(4).required(),
    street: Joi.string().required(),
  }),
});
