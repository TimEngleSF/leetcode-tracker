import { register } from './register.js';
import { login } from './post-login.js';
import { resetPass } from './resetPass.js';
import { validateSecAnswer } from './validateSecAnswer.js';

export const Auth = {
  register,
  login,
  resetPass,
  validateSecAnswer,
};
