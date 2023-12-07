import joi from 'joi';

export const getAnswerFormSchma = joi.object({
    questId: joi.string().length(24).required()
});
