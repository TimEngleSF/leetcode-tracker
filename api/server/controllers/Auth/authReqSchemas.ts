import Joi from 'joi';

const authReqSchemas = {
  validateSecAnswer: Joi.object({
    username: Joi.string().required(),
    yob: Joi.string().required(),
    color: Joi.string(),
    street: Joi.string(),
  }),
};
export default authReqSchemas;
