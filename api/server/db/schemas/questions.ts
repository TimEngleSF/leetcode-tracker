import Joi from 'joi';

export const addQuestionSchema = Joi.object({
  userID: Joi.string().required(),
  username: Joi.string().required(),
  questNum: Joi.number().required(),
  diff: Joi.number().required(),
  passed: Joi.boolean().required(),
  speed: Joi.number()
    .required()
    .when('passed', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.allow(null).default(null),
    }),
});
