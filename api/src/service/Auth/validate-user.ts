import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { ExtendedError } from '../../errors/helpers.js';
import { UserDocument } from '../../types/userTypes.js';

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
    error = new ExtendedError(
      `There was an error decoding the JWT Token: ${error.message}`
    );
    return { success: false, firstName: null, username: null };
  }

  try {
    userResult = await User.getByVerificationToken(token);
    if (!userResult || !userResult._id) {
      return { success: false, firstName: null, username: null };
    }
    await User.updateStatus(userResult._id, 'verified');
  } catch (error) {
    throw error;
  }
  // TODO: Blacklist the token
  return {
    success: true,
    firstName: userResult.firstName,
    username: userResult.displayUsername,
  };
};

export default validateUserService;
