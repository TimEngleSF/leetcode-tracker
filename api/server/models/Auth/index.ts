import { registerUser } from './registerUser.js';
import { loginUser } from './loginUser.js';
import { validateSecAnswer } from './validateSecAnswer.js';

const AuthModel = {
  registerUser,
  loginUser,
  validateSecAnswer,
};

export default AuthModel;
