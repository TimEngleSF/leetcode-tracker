import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { getUsersCollection } from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
const usersCollection = await getUsersCollection();

export const loginUser = async (body: {
  username: string;
  password: string;
}) => {
  try {
    const { username, password } = body;
    const userDoc = await usersCollection.findOne({ username: username });

    if (!userDoc) {
      return {
        code: 404,
        data: { message: `The username ${username} does not exist` },
      };
    }
    const isValidPass = await bcrypt.compare(password, userDoc.password);
    if (!isValidPass) {
      return {
        code: 404,
        data: { message: `Incorrect password` },
      };
    }

    let token: string;

    if (typeof JWT_SECRET === 'string') {
      token = jwt.sign(
        { userId: userDoc._id.toHexString(), username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return { code: 200, data: { ...userDoc, token } };
    } else {
      return {
        code: 400,
        message: { ...userDoc, token: 'JWT_SECRET not set properly' },
      };
    }
  } catch (error) {
    // await writeErrorToFile(error);
    return {
      code: 400,
      message: { error },
    };
  }
};
