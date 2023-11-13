import { ObjectId } from 'mongodb';
import Question from '../../models/Question.js';
import { QuestionInfoDocument } from '../../types/questionTypes.js';

const getReviewQuestionService = async (
  userId: string,
  newerThan: number,
  olderThan: number
): Promise<QuestionInfoDocument[]> => {
  try {
    const reviewQuestionResults = await Question.getReviewQuestions(
      new ObjectId(userId),
      newerThan,
      olderThan
    );
    const formattedResults = await Promise.all(
      reviewQuestionResults.map((questionNumber) =>
        Question.getQuestionInfo(questionNumber)
      )
    );
    return formattedResults;
  } catch (error) {
    throw error;
  }
};

export default getReviewQuestionService;
