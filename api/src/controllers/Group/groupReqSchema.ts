import joi from 'joi';

export const createReqSchema = joi.object({
    name: joi.string().required(),
    open: joi.boolean().required()
});

export const postMemberSchema = joi.object({
    groupId: joi.string().length(24).required(),
    passCode: joi.string().length(6)
});

export const putFeaturedQuestionSchema = joi.object({
    groupId: joi.string().length(24).required(),
    questNum: joi.number().required()
});

export const getMembersInfoSchema = joi.object({
    groupId: joi.string().length(24).required()
});

export const putAddAdminSchema = joi.object({
    groupId: joi.string().length(24).required(),
    userId: joi.string().length(24).required()
});
