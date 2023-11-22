import joi from 'joi';

export const getQuestionLeaderboardSchema = joi.object({
    questId: joi.number().required()
});
