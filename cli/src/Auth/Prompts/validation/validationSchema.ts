import joi from 'joi';

export const emailSchema = joi.string().email().min(5).max(32).required();

export const usernameFirstNameSchema = joi.string().min(2).max(16).required();

export const lastInitSchema = joi.string().length(1).required();

export const passwordSchema = joi.string().min(6).max(32).required();
