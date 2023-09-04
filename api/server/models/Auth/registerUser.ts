import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

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
  console.log(await userExists(username));
  if (await userExists(username)) {
    return {
      code: 400,
      data: { message: `The username ${username} is already in use` },
    };
  }

  try {
    const insertResult = await usersCollection.insertOne({
      username,
      firstName,
      lastInit,
      yob,
      password,
      questions: [],
    });

    const userID = new ObjectId(insertResult.insertedId);
    const newDocument = await usersCollection.findOne({ _id: userID });

    return { code: 201, data: newDocument };
  } catch (error) {
    return { code: 400, data: { message: 'There was an error' } };
  }
};
