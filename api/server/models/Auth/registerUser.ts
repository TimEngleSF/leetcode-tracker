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
  secAns: { color: string; yob: string; street: string };
}

export const registerUser = async (body: RegisterRequestBody) => {
  const { username, firstName, lastInit, yob, password, secAns } = body;

  if (await userExists(username)) {
    return {
      code: 400,
      data: { message: `The username ${username} is already in use` },
    };
  }

  try {
    const cryptPass = await bcrypt.hash(password, 10);
    const insertUserResult = await usersCollection.insertOne({
      username: username.toLowerCase(),
      firstName: `${firstName[0].toUpperCase()}${firstName.substring(1)}`,
      lastInit: lastInit.toUpperCase(),
      password: cryptPass,
      questions: [],
      lastActivity: Date.now(),
    });

    const secAnsPayload = {
      color: await bcrypt.hash(secAns.color, 10),
      yob: await bcrypt.hash(secAns.yob, 10),
      street: await bcrypt.hash(secAns.street, 10),
    };

    const insertSecurityResult = await secAnsCollection.insertOne({
      userID: insertUserResult.insertedId,
      username,
      answers: secAnsPayload,
    });

    let token;
    if (typeof JWT_SECRET === 'string') {
      token = jwt.sign(
        { userId: insertUserResult.insertedId, username },
        JWT_SECRET
      );
    }
    const userID = new ObjectId(insertUserResult.insertedId);
    const newDocument = await usersCollection.findOne(
      { _id: userID },
      { projection: { password: 0 } }
    );
    const responseBody = { ...newDocument, token };

    return { code: 201, data: responseBody };
  } catch (error) {
    // await writeErrorToFile(error);
    return { code: 400, data: { message: 'There was an error' } };
  }
};
