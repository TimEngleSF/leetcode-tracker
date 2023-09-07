import 'dotenv/config';
import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import writeErrorToFile from '../../errors/writeError.js';

const JWT_SECRET = process.env.JWT_SECRET;

let usersCollection: Collection;

const getCollection = async () => {
  if (usersCollection) {
    return usersCollection;
  }
  const db = await connectDb();
  usersCollection = db.collection('users');
};
getCollection();

const userExists = async (target: string) => {
  return await usersCollection.findOne({ username: target });
};

interface RegisterRequestBody {
  username: string;
  firstName: string;
  lastInit: string;
  yob: number;
  password: string;
}

export const registerUser = async (body: RegisterRequestBody) => {
  const { username, firstName, lastInit, yob, password } = body;

  if (await userExists(username)) {
    return {
      code: 400,
      data: { message: `The username ${username} is already in use` },
    };
  }

  const cryptPass = await bcrypt.hash(password, 10);

  try {
    const insertResult = await usersCollection.insertOne({
      username: username.toLowerCase(),
      firstName,
      lastInit,
      yob,
      password: cryptPass,
      questions: [],
      lastActivity: Date.now(),
    });

    let token;
    if (typeof JWT_SECRET === 'string') {
      token = jwt.sign(
        { userID: insertResult.insertedId, username },
        JWT_SECRET
      );
    }
    console.log(token);
    const userID = new ObjectId(insertResult.insertedId);
    const newDocument = await usersCollection.findOne({ _id: userID });
    const responseBody = { ...newDocument, token };

    return { code: 201, data: responseBody };
  } catch (error) {
    await writeErrorToFile(error);
    return { code: 400, data: { message: 'There was an error' } };
  }
};
