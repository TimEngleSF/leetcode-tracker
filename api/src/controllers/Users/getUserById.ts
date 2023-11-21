import 'dotenv/config';
import { Request, Response } from 'express-serve-static-core';
import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection';
// import writeErrorToFile from '../../errors/writeError.js';

let usersCollection: Collection;
const getCollection = async () => {
  if (usersCollection) {
    return usersCollection;
  }
  const db = await connectDb();
  usersCollection = db.collection('users');
};
getCollection();

export const getUserByID = async (req: Request, res: Response) => {
  const { userID } = req.params;
  const userObjID = new ObjectId(userID);
  const userData = await usersCollection.findOne({ _id: userObjID });
  res.status(200).send(userData);

  try {
  } catch (error) {
    // await writeErrorToFile(error);
    res.send({ error: error }).status(400);
  }
};
