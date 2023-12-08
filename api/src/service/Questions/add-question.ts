import { ObjectId } from 'mongodb';
import Question from '../../models/Question';
import {
    AddQuestionRequest,
    QuestionDocument
} from '../../types/questionTypes';

const postQuestionService = async (
    body: AddQuestionRequest
): Promise<QuestionDocument> => {
    try {
        const questionDocument = await Question.addQuestion({
            ...body,
            userId: new ObjectId(body.userId),
            created: new Date()
        });
        return questionDocument;
    } catch (error) {
        throw error;
    }
};
export default postQuestionService;
