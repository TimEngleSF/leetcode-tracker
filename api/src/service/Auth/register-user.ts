import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import {
  CreateUserInService,
  UserDocument,
  UserRegisterPayload,
} from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';

const registerUserService = async (
  userObj: CreateUserInService
): Promise<UserRegisterPayload> => {
  const { displayUsername, email, password, firstName, lastInit } = userObj;
  let usernameResult: UserDocument | null;
  let emailResult: UserDocument | null;
  let createUserResult: UserDocument;
  let token: string;
  try {
    [usernameResult, emailResult] = await Promise.all([
      User.getByUsername(displayUsername),
      User.getByEmail(email.toLowerCase()),
    ]);
  } catch (error) {
    throw error;
  }

  if (usernameResult || emailResult) {
    const error = new ExtendedError('Username or Email already in use.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPass = await bcrypt.hash(password, 12);

  try {
    createUserResult = await User.create({
      displayUsername,
      email,
      hashedPass,
      firstName,
      lastInit,
    });
  } catch (error) {
    throw error;
  }

  return {
    _id: createUserResult._id.toHexString(),
    username: createUserResult.displayUsername,
    email: createUserResult.email,
    firstName: createUserResult.firstName,
    lastInit: createUserResult.lastInit,
    status: createUserResult.status,
    lastActivity: createUserResult.lastActivity,
  };
};

export default registerUserService;
