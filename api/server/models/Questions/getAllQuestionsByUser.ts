import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

let questCollection: Collection;

const getCollection = async () => {
  if (questCollection) {
    return questCollection;
  }

  const db = await connectDb();
  questCollection = db.collection('questions');
};

getCollection();

export const getAllQuestionsByUser = async (userID: string) => {
  try {
    const userObjID = new ObjectId(userID);
    const questions = await questCollection
      .find({ userID: userObjID }, { projection: { _id: 0, userID: 0 } })
      .toArray();

    return { code: 200, data: questions };
    console.log(questions);
  } catch (err) {
    return { code: 400, data: err };
  }
};
