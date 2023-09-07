import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';
import writeErrorToFile from '../../errors/writeError.js';

let questCollection: Collection;

const getCollection = async () => {
  if (questCollection) {
    return;
  }

  const db = await connectDb();
  questCollection = db.collection('questions');
};

getCollection();

export const getUserQuestionsAll = async (userID: string) => {
  try {
    const userObjID = new ObjectId(userID);
    const questions = await questCollection
      .find({ userID: userObjID }, { projection: { _id: 0, userID: 0 } })
      .toArray();

    return { code: 200, data: questions };
    console.log(questions);
  } catch (error) {
    await writeErrorToFile(error);
    return { code: 400, data: error };
  }
};
