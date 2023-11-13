import { ObjectId } from 'mongodb';
import Question from '../../models/Question.js';
import { AddQuestionRequest } from '../../types/questionTypes.js';

const postQuestionService = async (body: AddQuestionRequest) => {
  try {
    await Question.addQuestion({
      ...body,
      userId: new ObjectId(body.userId),
      created: new Date(),
    });
  } catch (error) {
    throw error;
  }
};
export default postQuestionService;
