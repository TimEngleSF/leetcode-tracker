import { registerUser } from './registerUser.js';
import { loginUser } from './loginUser.js';
import { validateSecAnswer } from './validateSecAnswer.js';
import { resetPass } from './resetPass.js';

const AuthModel = {
  registerUser,
  loginUser,
  validateSecAnswer,
  resetPass,
};

export default AuthModel;
