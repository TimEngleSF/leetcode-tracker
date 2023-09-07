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

export const getUserQuestionsByNum = async (
  userID: string,
  questNum: number
) => {
  try {
    const userObjID = new ObjectId(userID);
    const result = await questCollection
      .aggregate([
        {
          $match: {
            userID: userObjID,
            questNum,
          },
        },
        {
          $group: {
            _id: {
              questNum: '$questNum',
              diff: '$diff',
              username: '$username',
              userID: '$userID',
            },
            questions: {
              $push: {
                _id: '$_id',
                passed: '$passed',
                speed: '$speed',
                created: '$created',
              },
            },
          },
        },
      ])
      .toArray();
    return {
      code: 200,
      data: { general: result[0]._id, questions: result[0].questions },
    };
  } catch (error) {
    await writeErrorToFile(error);
    return {
      code: 400,
      message: { error },
    };
  }
};
