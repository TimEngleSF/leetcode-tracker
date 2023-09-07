import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

import writeErrorToFile from '../../errors/writeError.js';

let questCollection: Collection;

const getCollection = async () => {
  if (questCollection) {
    return questCollection;
  }

  const db = await connectDb();
  questCollection = db.collection('questions');
};

getCollection();

export const getGeneralLeaderBoard = async () => {
  try {
    const result = await questCollection
      .aggregate([
        {
          $group: {
            _id: '$username',
            passedCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$passed', true],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();
    if (!result) {
      return {
        code: 400,
        data: {
          message: `There are no questions added to the database yet!\nPlease add the first question.`,
        },
      };
    } else {
      return { code: 200, data: result };
    }
  } catch (error) {
    await writeErrorToFile(
      error,
      'Error arrised when executing getGeneralLeaderBoard model'
    );
    return { code: 400, error };
  }
};
