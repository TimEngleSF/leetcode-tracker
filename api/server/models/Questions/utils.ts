import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';
import writeErrorToFile from '../../errors/writeError.js';

let usersCollection: Collection;

const getCollection = async () => {
  if (usersCollection) {
    return usersCollection;
  }
  const db = await connectDb();
  usersCollection = db.collection('users');
};
getCollection();

// Functions
export const addQuestIDtoUser = async (questNum: number, userId: ObjectId) => {
  try {
    const data = await usersCollection.findOne(
      { _id: userId },
      { projection: { questions: 1 } }
    );
    console.log('hi');
    if (data !== null) {
      const { questions } = data;
      if (questions.includes(questNum)) {
        return;
      }
      const result = await usersCollection.updateOne(
        { _id: userId },
        { $push: { questions: questNum } }
      );
    }
  } catch (error) {
    await writeErrorToFile(error);
  }
};
