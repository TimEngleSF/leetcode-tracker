import { Collection, ObjectId, Db } from 'mongodb';
import { getCollection } from '../db/connection';
import {
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
  QuestionByUserIdQueryResult,
  GetGeneralLeaderboardQuery,
} from '../types/questionTypes';
import { ExtendedError } from '../errors/helpers';
import { injectDb } from './helpers/injectDb';
import { convertDaysToMillis } from './helpers/questionHelpers';

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
    } catch (error) {
      throw error;
    }
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
              // first pipeline for general leaderboard
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
              // second pipeline for user-specific leaderboard
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
