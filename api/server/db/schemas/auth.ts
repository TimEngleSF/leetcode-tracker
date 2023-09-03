import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastInit: Joi.string().required(),
  yob: Joi.string().required(),
  password: Joi.string().required(),
});
