import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection.js';
import {
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
  QuestionByUserIdQueryResult,
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
};
export default Question;
