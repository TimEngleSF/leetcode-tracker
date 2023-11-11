import bcrypt from 'bcrypt';
import { getUsersCollection } from '../../db/collections.js';

const usersCollection = await getUsersCollection();

export const resetPass = async (username: string, password: string) => {
  try {
    const userData = await usersCollection.findOne({ username });
    if (!userData) {
      return { code: 404, data: `No user with the username ${username} found` };
    }
    const encryptedPass = await bcrypt.hash(password, 10);
    console.log(encryptedPass);
    const passwordResetResult = await usersCollection.updateOne(
      { username },
      { $set: { password: encryptedPass } }
    );
    return {
      code: 200,
      data: 'Successfully reset password',
    };
  } catch (error) {
    return {
      code: 400,
      data: 'There was an error processing request',
    };
  }
};
