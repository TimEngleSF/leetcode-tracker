import { Collection, ObjectId, Db } from 'mongodb';
import { getCollection } from '../db/connection';
import {
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
  QuestionByUserIdQueryResult,
  GetGeneralLeaderboardQuery,
  GetQuestionLeaderboardQueryResult,
  QuestionLeaderboardUserData,
} from '../types/questionTypes';
import { ExtendedError } from '../errors/helpers';
import { injectDb } from './helpers/injectDb';
import { convertDaysToMillis } from './helpers/questionHelpers';
import User from './User';
import { UserDocument } from '../types';

let questionCollection: Collection<Partial<QuestionDocument>>;
let questionInfoCollection: Collection<QuestionInfoDocument>;

const assignQuestionCollection = async () => {
  if (!questionCollection && process.env.NODE_ENV !== 'test') {
    questionCollection = await getCollection<Partial<QuestionDocument>>(
      'questions'
    );
  }
  if (!questionInfoCollection && process.env.NODE_ENV !== 'test') {
    questionInfoCollection = await getCollection<QuestionInfoDocument>(
      'questionData'
    );
  }
};

assignQuestionCollection();

const Question = {
  injectDb: (db: Db) => {
    if (process.env.NODE_ENV === 'test') {
      questionCollection = injectDb<Partial<QuestionDocument>>(db, 'questions');
      questionInfoCollection = injectDb<QuestionInfoDocument>(
        db,
        'questionData'
      );
    }
  },
  addQuestion: async (questionData: NewQuestion): Promise<void> => {
    let transformedUserId: ObjectId;
    if (typeof questionData.userId === 'string') {
      transformedUserId = new ObjectId(questionData.userId);
    } else {
      transformedUserId = questionData.userId;
    }

    const transformedQuestionData: Omit<NewQuestion, 'userId'> & {
      userId: ObjectId;
    } = {
      ...questionData,
      userId: transformedUserId,
    };

    try {
      const result = await questionCollection.insertOne(
        transformedQuestionData
      );
      if (!result.acknowledged) {
        throw new Error('Insertion not acknowledged');
      }
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error adding the question result: ${error.message}`
      );
      extendedError.statusCode = 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },

  getQuestion: async (
    questId: string | ObjectId
  ): Promise<QuestionDocument> => {
    if (typeof questId === 'string') {
      questId = new ObjectId(questId);
    }
    try {
      const result = await questionCollection.findOne<QuestionDocument>({
        _id: questId,
      });
      if (!result) {
        const extendedError = new ExtendedError('No question found');
        extendedError.statusCode = 404;
        throw extendedError;
      }
      return result;
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error getting the question information: ${error.message}`
      );
      extendedError.statusCode = error.statusCode || 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },

  getQuestionInfo: async (questId: number): Promise<QuestionInfoDocument> => {
    try {
      const result = await questionInfoCollection.findOne({ questId });
      if (!result) {
        const error = new ExtendedError(
          `Question does not exist in the database`
        );
        error.statusCode = 404;
        throw error;
      }

      return result;
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error getting the question information: ${error.message}`
      );
      extendedError.statusCode = error.statusCode || 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },

  getQuestionsByUser: async (
    userId: ObjectId,
    question?: number
  ): Promise<Partial<QuestionByUserIdQueryResult>[] | []> => {
    let result;

    // Query
    try {
      if (!question) {
        const cursor = questionCollection.find(
          { userId },
          { projection: { _id: 0, username: 0, userId: 0 } }
        );
        result = await cursor.toArray();
      } else {
        const cursor = questionCollection.find(
          { userId, questNum: question },
          { projection: { _id: 0, userId: 0, username: 0, questNum: 0 } }
        );
        result = await cursor.toArray();
      }
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error getting user's questions data: ${error.message}`
      );
      extendedError.statusCode = 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }

    return result;
  },

  getReviewQuestions: async (
    userId: ObjectId | string,
    startRange: number, // How many days ago should the range begin?
    endRange: number // How many days ago should the range end? aka we dont want dates that a previous to this
  ): Promise<QuestionInfoDocument[]> => {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }

    const currentTime = new Date().getTime();
    const endOfRange = new Date(currentTime - convertDaysToMillis(endRange));
    const startOfRange = new Date(
      currentTime - convertDaysToMillis(startRange)
    );

    try {
      const pipeline = [
        {
          $match: {
            userId: new ObjectId(userId),
            created: { $gte: endOfRange, $lte: startOfRange },
          },
        },
        {
          $sort: { created: -1 },
        },
        {
          $group: { _id: '$questNum' }, // Group duplicates
        },
        {
          $lookup: {
            from: 'questionData',
            localField: '_id',
            foreignField: 'questId',
            as: 'questionDetails',
          },
        },
        { $unwind: '$questionDetails' },
        { $replaceRoot: { newRoot: '$questionDetails' } },
      ];

      const results = (await questionCollection
        .aggregate(pipeline)
        .toArray()) as QuestionInfoDocument[];

      return results;
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error fetching review questions: ${error.message}`
      );
      extendedError.statusCode = 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },

  getGeneralLeaderboard: async (
    userId: string | ObjectId
  ): Promise<GetGeneralLeaderboardQuery> => {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    try {
      const cursor = questionCollection.aggregate([
        // First, get the general leaderboard with ranks
        { $match: { passed: true } },
        { $group: { _id: '$userId', passedCount: { $sum: 1 } } },
        { $match: { passedCount: { $gt: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            userId: '$_id',
            _id: 0,
            name: {
              $concat: [
                '$userInfo.firstName',
                ' ',
                { $substrCP: ['$userInfo.lastInit', 0, 1] },
                '.',
              ],
            },
            passedCount: 1,
            lastActivity: '$userInfo.lastActivity',
          },
        },
        { $sort: { passedCount: -1 } },
        // Store the complete leaderboard and add ranks
        {
          $group: {
            _id: null,
            leaderboard: { $push: '$$ROOT' },
          },
        },
        {
          $addFields: {
            leaderboardWithRank: {
              $map: {
                // map over leaderboard with rank
                input: { $range: [0, { $size: '$leaderboard' }] }, // input range is 0 to length of $leaderboard
                as: 'index', // current value will be called index
                in: {
                  $mergeObjects: [
                    { rank: { $add: ['$$index', 1] } }, // get the users rank by adding current index by 1
                    { $arrayElemAt: ['$leaderboard', '$$index'] }, //merge new rank field with the object at the current index
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            userResult: {
              $first: {
                $filter: {
                  input: '$leaderboardWithRank',
                  as: 'item',
                  cond: { $eq: ['$$item.userId', userId] },
                },
              },
            },
          },
        },
        {
          $project: {
            leaderboardResult: '$leaderboardWithRank',
            userResult: 1,
          },
        },
      ]);
      const [result] = await cursor.toArray();

      // Create placeholder userResults if user has not yet added any questions to the db
      let loggedInUserData;
      if (!result.userResult) {
        const document = (await User.getById(userId)) as UserDocument;
        loggedInUserData = {
          userId: userId,
          name: `${document.firstName} ${document.lastInit}`,
          passedCount: 0,
          rank: null,
          lastActivity: document.lastActivity,
        };
      }
      return {
        leaderboardResult: result.leaderboardResult,
        userResult: result.userResult ? result.userResult : loggedInUserData,
      };
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error getting the Leaderboard: ${error.message}`
      );
      extendedError.statusCode = 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },

  getQuestionLeaderboard: async (
    userId: string | ObjectId,
    targetQuestion: number,
    sortBySpeed: boolean = true
  ): Promise<GetQuestionLeaderboardQueryResult | string> => {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }

    try {
      await Question.getQuestionInfo(targetQuestion);
    } catch (error) {
      throw error;
    }

    const pipeline = [
      { $match: { questNum: targetQuestion, passed: true } },
      {
        $group: {
          _id: '$userId',
          passedCount: { $sum: 1 },
          minSpeed: { $min: '$speed' },
          mostRecent: { $max: '$created' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          _id: 0,
          name: {
            $concat: [
              '$userInfo.firstName',
              ' ',
              { $substrCP: ['$userInfo.lastInit', 0, 1] },
              '.',
            ],
          },
          passedCount: 1,
          minSpeed: 1,
          mostRecent: 1,
        },
      },
      { $sort: sortBySpeed ? { minSpeed: 1 } : { passedCount: -1 } },
      { $group: { _id: null, leaderboard: { $push: '$$ROOT' } } },
      {
        $addFields: {
          leaderboardWithRank: {
            $map: {
              input: { $range: [0, { $size: '$leaderboard' }] },
              as: 'index',
              in: {
                $mergeObjects: [
                  { rank: { $add: ['$$index', 1] } },
                  { $arrayElemAt: ['$leaderboard', '$$index'] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          userResult: {
            $first: {
              $filter: {
                input: '$leaderboardWithRank',
                as: 'item',
                cond: { $eq: ['$$item.userId', userId] },
              },
            },
          },
        },
      },
      {
        $project: {
          leaderboardResult: '$leaderboardWithRank',
          userResult: '$userResult',
          _id: 0,
        },
      },
    ];

    try {
      const [result] = (await questionCollection
        .aggregate(pipeline)
        .toArray()) as GetQuestionLeaderboardQueryResult[];
      // If there are no submissions for this question return this string to display
      if (!result) {
        return 'No one has added their results for this question. You could be first!';
      }

      // If there is data for this question
      let loggedInUserData;
      if (result.userResult === undefined) {
        const document = (await User.getById(userId)) as UserDocument;
        loggedInUserData = {
          userId: userId,
          name: `${document.firstName} ${document.lastInit}`,
          passedCount: 0,
          rank: null,
          minSpeed: null,
          mostRecent: null,
        };
      }

      return {
        leaderboardResult: result.leaderboardResult,
        userResult: result.userResult
          ? result.userResult
          : (loggedInUserData as QuestionLeaderboardUserData),
      };
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error getting the Leaderboard: ${error.message}`
      );
      extendedError.statusCode = 500;
      extendedError.stack = error.stack;
      throw extendedError;
    }
  },
};
export default Question;
