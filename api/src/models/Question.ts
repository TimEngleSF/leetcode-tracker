import { getCollection } from '../db/connection.js';
import {
  AddQuestionRequest,
  NewQuestion,
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
      throw extendedError;
    }
  },
};
export default Question;
