import joi from 'joi';

export const postQuestionSchema = joi.object({
  userId: joi.string().required(),
  username: joi.string().required(),
  questNum: joi.number().required(),
  passed: joi.boolean().required(),
  speed: joi.number(),
});

export const getQuestionInfoSchema = joi.object({
  quest: joi.number().required(),
});

export const getQuestionsByUserIdSchema = joi.object({
  userId: joi.string().required(),
  question: joi.number(),
});
