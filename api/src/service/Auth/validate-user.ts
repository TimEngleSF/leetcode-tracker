import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { ExtendedError } from '../../errors/helpers.js';
import { UserDocument } from '../../types/userTypes.js';
import Blacklist from '../../models/Blacklist.js';

const { EMAIL_VERIFICATION_SECRET } = process.env;
export const validateUserService = async (
  token: string
): Promise<{
  success: boolean;
  username: string | null;
  firstName: string | null;
}> => {
  let userResult: UserDocument | null;
  try {
    if (!EMAIL_VERIFICATION_SECRET) {
      throw new Error('Missing Email Secret on Server');
    }
    jwt.verify(token, EMAIL_VERIFICATION_SECRET);
  } catch (error: any) {
    const extendedError = new ExtendedError(
      `There was an error decoding the JWT Token: ${error.message}`
    );
    extendedError.stack = error.stack;
    console.log(extendedError);
    return { success: false, firstName: null, username: null };
  }

  try {
    userResult = await User.getByVerificationToken(token);
    if (!userResult || !userResult._id) {
      return { success: false, firstName: null, username: null };
    }
    await Promise.all([
      User.updateStatus(userResult._id, 'verified'),
      User.updateVerificationToken(userResult._id, ''),
      Blacklist.addBlacklistToken(token, 'EMAIL_VERIFICATION_SECRET'),
    ]);
    // await User.updateStatus(userResult._id, 'verified');
    // await User.updateVerificationToken(userResult._id, '');
    // await Blacklist.addBlacklistToken(token, 'EMAIL_VERIFICATION_SECRET');
  } catch (error) {
    console.log(error);
    return { success: false, firstName: null, username: null };
  }
  // TODO: Blacklist the token
  return {
    success: true,
    firstName: userResult.firstName,
    username: userResult.displayUsername,
  };
};

export default validateUserService;
