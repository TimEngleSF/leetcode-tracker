import { getCollection } from '../db/connection.js';
import {
  AddQuestionRequest,
  NewQuestion,
  QuestionInfoDocument,
  QuestionDocument,
} from '../types/questionTypes.js';
import { ExtendedError } from '../errors/helpers.js';

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

  getQuestionInfo: async (questId: number): Promise<QuestionInfoDocument> => {
    try {
      const collection = await getCollection<QuestionInfoDocument>(
        'questionData'
      );
      console.log(questId, typeof questId);

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
};
export default Question;
