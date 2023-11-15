import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection.js';
import {
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
  QuestionByUserIdQueryResult,
  GetGeneralLeaderboardQuery,
  GetUserPassedCount,
} from '../types/questionTypes.js';
import { ExtendedError } from '../errors/helpers.js';
import { convertDaysToMillis } from './helpers/questionHelpers.js';

const Question = {
  addQuestion: async (questionData: NewQuestion): Promise<void> => {
    try {
      const collection = await getCollection<Partial<QuestionDocument>>(
        'questions'
      );
      const result = await collection.insertOne({ ...questionData });
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

  getQuestion: async (questId: string | ObjectId) => {
    if (typeof questId === 'string') {
      questId = new ObjectId(questId);
    }
    try {
      const collection = await getCollection<QuestionDocument>('questions');
      const result = await collection.findOne<QuestionDocument>({
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
      const collection = await getCollection<QuestionInfoDocument>(
        'questionData'
      );

      const result = await collection.findOne({ questId });
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
  ): Promise<QuestionByUserIdQueryResult[] | []> => {
    let result;
    let collection: Collection<QuestionDocument>;
    try {
      collection = await getCollection<QuestionDocument>('questions');
    } catch (error) {
      throw error;
    }
    // Query
    try {
      if (!question) {
        const cursor = collection.find(
          { userId },
          { projection: { _id: 0, username: 0, userId: 0 } }
        );
        result = await cursor.toArray();
      } else {
        const cursor = collection.find(
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
    }
    if (!result) {
      return [];
    }
    return result;
  },

  getReviewQuestions: async (
    userId: ObjectId,
    newerThan: number,
    olderThan: number
  ): Promise<number[] | []> => {
    let collection: Collection<QuestionDocument>;
    let excludeResults: Partial<QuestionDocument>[];

    try {
      collection = await getCollection<QuestionDocument>('questions');
    } catch (error) {
      throw error;
    }
    const currentTime = new Date().getTime();
    const endOfRangeMillis = currentTime - convertDaysToMillis(olderThan);
    const startOfRangeMillis = currentTime - convertDaysToMillis(newerThan);

    // Stage 1: Get excluded questNums
    // This will prevent including recently completed question in the "older" time ranges
    try {
      excludeResults = await collection
        .find({
          userId: new ObjectId(userId),
          created: { $gte: new Date(endOfRangeMillis) },
        })
        .project({ questNum: 1, _id: 0 })
        .toArray();
    } catch (error) {
      throw error;
    }

    const excludeQuestNums = excludeResults.map((doc) => doc.questNum);

    // Stage 2: Actual query
    const results = await collection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            questNum: { $nin: excludeQuestNums }, // Dont include these older documents
            created: {
              $gte: new Date(startOfRangeMillis),
              $lte: new Date(endOfRangeMillis),
            },
          },
        },
        {
          $sort: { created: -1 },
        },
        {
          $group: { _id: '$questNum' },
        },
        {
          $group: {
            _id: null,
            uniqueQuestNums: { $push: '$_id' },
          },
        },
        {
          $project: { _id: 0, reviewQuestions: '$uniqueQuestNums' },
        },
      ])
      .toArray();

    return results[0]?.reviewQuestions || [];
  },

  getGeneralLeaderBoard: async (): Promise<GetGeneralLeaderboardQuery[]> => {
    try {
      const collection = await getCollection<QuestionDocument>('questions');

      const cursor = collection.aggregate([
        {
          $match: {
            passed: true,
          },
        },
        {
          $group: {
            _id: '$userId',
            passedCount: { $sum: 1 },
          },
        },
        {
          $match: {
            passedCount: { $gt: 1 },
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
        {
          $unwind: '$userInfo',
        },
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
        {
          $sort: { passedCount: -1 },
        },
      ]);

      const result = await cursor.toArray();
      return result as GetGeneralLeaderboardQuery[];
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getQuestionLeaderboard: async (targetQuestion: number) => {
    try {
      if (!(await Question.getQuestionInfo(targetQuestion))) {
        const extendedError = new ExtendedError(
          `There is no question with an ID of ${targetQuestion}`
        );
        extendedError.statusCode = 404;
        throw ExtendedError;
      }

      const collection = await getCollection<QuestionDocument>('questions');

      const cursor = collection.aggregate([
        {
          $match: {
            questNum: targetQuestion,
            passed: true,
          },
        },
        {
          $group: {
            _id: '$userId',
            passedCount: { $sum: 1 },
            minSpeed: { $min: '$speed' },
            mostRecent: { $max: '$created' },
          },
        },
        {
          $match: {
            passedCount: { $gt: 0 },
          },
        },
        {
          $sort: { passedCount: -1 },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userData',
          },
        },
        {
          $unwind: '$userData',
        },
        {
          $project: {
            userId: '$_id',
            questNum: 1,
            passedCount: 1,
            minSpeed: 1,
            mostRecent: 1,
            firstName: '$userData.firstName',
            lastInit: '$userData.lastInit',
          },
        },
      ]);
      const result = await cursor.toArray();
      return result;
    } catch (error) {
      throw error;
    }
  },

  getUserLeaderBoardResults: async (
    userId: string | ObjectId
  ): Promise<GetUserPassedCount> => {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    try {
      const collection = await getCollection<QuestionDocument>('questions');
      const cursor = collection.aggregate([
        {
          $match: {
            userId,
            passed: true,
          },
        },
        {
          $group: {
            _id: '$userId',
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
      ]);
      const result = await cursor.toArray();
      return result[0] as GetUserPassedCount;
    } catch (error) {
      throw error;
    }
  },
};
export default Question;
