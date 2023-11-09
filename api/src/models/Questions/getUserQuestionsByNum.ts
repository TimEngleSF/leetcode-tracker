import { ObjectId } from 'mongodb';

import { getQuestCollection } from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

const questCollection = await getQuestCollection();

export const getUserQuestionsByNum = async (
  userID: string,
  questNum: number
) => {
  try {
    // const userObjID = new ObjectId(userID);
    const result = await questCollection
      .aggregate([
        {
          $match: {
            userID: new ObjectId(userID),
            questNum: questNum,
          },
        },
        {
          $group: {
            _id: {
              questNum: '$questNum',
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
    // await writeErrorToFile(error);
    return {
      code: 400,
      message: { error },
    };
  }
};
