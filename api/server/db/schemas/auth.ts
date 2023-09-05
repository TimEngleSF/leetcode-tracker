import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required().max(10),
  firstName: Joi.string().required().max(10),
  lastInit: Joi.string().required().max(1),
  yob: Joi.string().required().max(4),
  password: Joi.string().required().max(32),
});
