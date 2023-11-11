import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import Blacklist from '../../models/Blacklist.js';
import { UserDocument } from '../../types/userTypes.js';

const { PASSWORD_VERIFICATION_SECRET } = process.env;

type DecodedToken = { email: string; exp: number; iat: number };

const setNewPasswordService = async (password: string, token: string) => {
  let hashedPass: string;
  let userDocument: UserDocument | null;
  let decodedToken: DecodedToken;
  [hashedPass] = await Promise.all([
    bcrypt.hash(password, 12),
    Blacklist.addBlacklistToken(token, 'PASSWORD_VERIFICATION_SECRET'),
  ]);

  if (!PASSWORD_VERIFICATION_SECRET) {
    throw new Error('Server missing PASSWORD_VERIFICATION_SECRET');
  }

  try {
    decodedToken = jwt.verify(
      token,
      PASSWORD_VERIFICATION_SECRET
    ) as DecodedToken;
  } catch (error) {
    throw error;
  }

  try {
    userDocument = await User.getByEmail(decodedToken.email);
    if (!userDocument) {
      throw new Error('A user could not be found');
    }
    if (!userDocument._id) {
      throw new Error('Could not locate an _id field within userDocument');
    }
    await User.updatePassword(userDocument._id, hashedPass);
  } catch (error) {
    throw error;
  }
};
export default setNewPasswordService;
