import joi from 'joi';

export const getAnswerFormSchma = joi.object({
    questId: joi.string().length(24).required()
});

export const postAnswerFormSchema = joi.object({
    questId: joi.string().length(24).required(),
    answerCodeInput: joi.string()
});

export const getFeaturedQuestionResultsForGroupSchema = joi.object({
    groupId: joi.string().length(24).required()
});
