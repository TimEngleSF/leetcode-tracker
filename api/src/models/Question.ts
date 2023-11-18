import { Collection, ObjectId, Db } from 'mongodb';
import { getCollection } from '../db/connection.js';
import {
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
  QuestionByUserIdQueryResult,
  GetGeneralLeaderboardQuery,
} from '../types/questionTypes.js';
import { ExtendedError } from '../errors/helpers';
import { injectDb } from './helpers/injectDb.js';
import { convertDaysToMillis } from './helpers/questionHelpers.js';

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
    try {
      const result = await questionCollection.insertOne({ ...questionData });
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
    let excludeResults: Partial<QuestionDocument>[];

    const currentTime = new Date().getTime();
    const endOfRangeMillis = currentTime - convertDaysToMillis(olderThan);
    const startOfRangeMillis = currentTime - convertDaysToMillis(newerThan);

    // Stage 1: Get excluded questNums
    // This will prevent including recently completed question in the "older" time ranges
    try {
      excludeResults = await questionCollection
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
    const results = await questionCollection
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

  getGeneralLeaderBoard: async (
    userId: string | ObjectId
  ): Promise<GetGeneralLeaderboardQuery> => {
    if (typeof userId === 'string') {
      userId = new ObjectId(userId);
    }
    try {
      const cursor = questionCollection.aggregate([
        {
          $facet: {
            generalLeaderBoard: [
              // Your first pipeline for general leaderboard
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
            ],
            userResult: [
              // Your second pipeline for user-specific leaderboard
              { $match: { userId, passed: true } },
              { $group: { _id: '$userId', passedCount: { $sum: 1 } } },
              {
                $lookup: {
                  from: 'users',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'loggedInUserInfo',
                },
              },
              { $unwind: '$loggedInUserInfo' },
              {
                $project: {
                  userId: '$_id',
                  name: {
                    $concat: [
                      '$loggedInUserInfo.firstName',
                      ' ',
                      { $substrCP: ['$loggedInUserInfo.lastInit', 0, 1] },
                      '.',
                    ],
                  },
                  passedCount: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
      ]);

      const [result] = await cursor.toArray();
      return {
        leaderboardResult: result.generalLeaderBoard,
        userResult: result.userResult[0]
          ? result.userResult[0]
          : { _id: userId, passedCount: 0 },
      };
    } catch (error) {
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

      const cursor = questionCollection.aggregate([
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
            _id: 0,
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
};
export default Question;
