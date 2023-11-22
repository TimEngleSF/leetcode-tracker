import joi from 'joi';

export const createReqSchema = joi.object({
    name: joi.string().required(),
    open: joi.boolean().required()
});
