import { register } from './register.js';
import SubAuth from './Auth.js';
import { resetPass } from './resetPass.js';
import { validateSecAnswer } from './validateSecAnswer.js';

export const Auth = {
  register,
  SubAuth,
  resetPass,
  validateSecAnswer,
};
