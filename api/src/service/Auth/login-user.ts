import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { ExtendedError } from '../../errors/helpers.js';
import { UserDocument, UserLoginPayload } from '../../types/userTypes.js';

const { JWT_SECRET } = process.env;

const loginService = async (
  username: string,
  password: string
): Promise<UserLoginPayload> => {
  let user: UserDocument | null;
  try {
    user = await User.getByUsername(username);
    if (!user) {
      const error = new ExtendedError('Incorrect Email or Password');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'pending') {
      const error = new ExtendedError('Please verify account');
      error.statusCode = 401;
      throw error;
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      const error = new ExtendedError('Incorrect Email or Password');
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    throw error;
  }

  let token: string;
  try {
    if (!JWT_SECRET) {
      const error = new ExtendedError(
        'Internal Service Error: Missing JWT Secret'
      );
      error.statusCode = 500;
      throw error;
    }
    token = jwt.sign(
      {
        userId: user._id,
        username: user.displayUsername,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    const extendedError = new ExtendedError(
      `Internal Service Error: ${error.message}`
    );
    extendedError.statusCode = 500;
    extendedError.stack = error.stack;
    throw extendedError;
  }

  if (!user._id) {
    throw new Error('New user is missing an _id property'); // Unexpected Error, TypeScript issue
  }

  const payload = {
    user: {
      _id: user._id.toHexString(),
      username: user.displayUsername,
      email: user.email,
      firstName: user.firstName,
      lastInit: user.lastInit,
      status: user.status,
      lastActivity: user.lastActivity,
    },
    token,
  };
  return payload;
};

export default loginService;
