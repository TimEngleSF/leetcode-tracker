import { WithId } from 'mongodb';
import Question from '../../models/Question.js';
import User from '../../models/User.js';
import {
  QuestionDocument,
  getQuestionsByUserIdResponse,
} from '../../types/questionTypes.js';
import { ExtendedError } from '../../errors/helpers.js';
import { UserDocument } from '../../types/userTypes.js';

const getQuestionsByUserIdService = async (
  userId: string,
  question?: number
): Promise<getQuestionsByUserIdResponse> => {
  let result;
  let user: UserDocument | null;
  // Check if user exists
  try {
    user = await User.getById(userId);
    if (!user) {
      const error = new ExtendedError('No user by that id exists...');
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    throw error;
  }
  // If user exists and no question in query params
  if (!question) {
    try {
      result = await Question.getQuestionsByUser(user._id);
    } catch (error) {
      throw error;
    }
    // If user exists and question in query params
  } else {
    try {
      result = await Question.getQuestionsByUser(user._id, question);
    } catch (error) {
      throw error;
    }
  }

  if (!result)
    return {
      general: {
        questNum: question,
        username: user.displayUsername,
        userId: user._id.toHexString(),
      },
      questions: [],
    };
  return {
    general: {
      questNum: question,
      username: user.displayUsername,
      userId: user._id.toHexString(),
    },
    questions: [...result],
  };
};

export default getQuestionsByUserIdService;
