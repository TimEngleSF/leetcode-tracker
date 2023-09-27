import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  getUsersCollection,
  getSecurityAnswers,
} from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

const JWT_SECRET = process.env.JWT_SECRET;

const usersCollection = await getUsersCollection();
const secAnsCollection = await getSecurityAnswers();

const userExists = async (target: string) => {
  return await usersCollection.findOne({ username: target });
};

interface RegisterRequestBody {
  username: string;
  firstName: string;
  lastInit: string;
  yob: number;
  password: string;
  secAns: { color: string; street: string };
}

export const registerUser = async (body: RegisterRequestBody) => {
  const { username, firstName, lastInit, yob, password, secAns } = body;

  if (await userExists(username)) {
    return {
      code: 400,
      data: { message: `The username ${username} is already in use` },
    };
  }

  const cryptPass = await bcrypt.hash(password, 10);

  try {
    const insertUserResult = await usersCollection.insertOne({
      username: username.toLowerCase(),
      firstName,
      lastInit,
      yob,
      password: cryptPass,
      questions: [],
      lastActivity: Date.now(),
    });

    const insertSecurityResult = await secAnsCollection.insertOne({
      userID: insertUserResult.insertedId,
      answers: secAns,
    });

    let token;
    if (typeof JWT_SECRET === 'string') {
      token = jwt.sign(
        { userID: insertUserResult.insertedId, username },
        JWT_SECRET
      );
    }
    const userID = new ObjectId(insertUserResult.insertedId);
    const newDocument = await usersCollection.findOne({ _id: userID });
    const responseBody = { ...newDocument, token };

    return { code: 201, data: responseBody };
  } catch (error) {
    // await writeErrorToFile(error);
    return { code: 400, data: { message: 'There was an error' } };
  }
};
