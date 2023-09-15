import { getQuestCollection } from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

let questCollection = await getQuestCollection();

export const getGeneralLeaderBoard = async () => {
  try {
    const result = await questCollection
      .aggregate([
        {
          $group: {
            _id: '$userID',
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
    return { code: 400, error };

    // try {
    //   await writeErrorToFile(
    //     error,
    //     'Error arrised when executing getGeneralLeaderBoard model'
    //   );
    //   return { code: 400, error };
    // } catch (error) {
    //   return { code: 500, error };
    // }
  }
};
