import { Request, Response, NextFunction } from 'express';
import Filter from 'bad-words';
import hljs from 'highlight.js';
import {
    getAnswerFormSchma,
    getFeaturedQuestionResultsForGroupSchema,
    postAnswerFormSchema
} from './answersReqSchema';
import { RequestWithUser } from '../../types/controllerTypes';
import Answer from '../../models/Answer';
import Group from '../../models/Group';
import { AnswerListEntry } from '../../types/answer-types';

const filter = new Filter();
const answers = {
    getAnswerSubmitForm: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user;
        const { questId } = req.params;

        const { error } = getAnswerFormSchma.validate({ questId });
        if (error) {
            return res.status(422).send({
                message:
                    'A query paramater of questId with a question Id value is required'
            });
        }

        return res.render('Answers/post-answer-form', {
            questId
        });
    },

    postAnswerForm: async (req: Request, res: Response, next: NextFunction) => {
        const { questId, answerCodeInput } = req.body;
        console.log({ questId }, { answerCodeInput });
        const { error } = postAnswerFormSchema.validate({
            questId,
            answerCodeInput
        });

        console.log(error);

        if (error) {
            return res.render('Answers/post-answer-error', {
                error: 'Input is required'
            });
        }

        if (filter.isProfane(answerCodeInput)) {
            return res.render('Answers/post-answer-error', {
                error: 'Profane langauge is prohibited'
            });
        }

        try {
            const answer = new Answer();
            const answerId = await answer.create({
                questId,
                code: answerCodeInput
            });
            if (answerId) {
                return res.render('Answers/post-answer-success');
            }
        } catch (error: any) {
            const isDuplicate = error.message.split(' ').includes('E11000');
            return res.render('Answers/post-answer-error', {
                error: isDuplicate
                    ? 'You have already submitted your code...'
                    : error.message
            });
        }
    },

    getAllAnswersByUserId: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;

        try {
            const answerDocuments = await Answer.findAnswersByUserId({
                userId
            });
            return res.status(200).send(answerDocuments);
        } catch (error) {
            next(error);
        }
    },

    getFeaturedQuestionResultsForGroup: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { groupId } = req.params;

        console.log(groupId);

        const { error } = getFeaturedQuestionResultsForGroupSchema.validate({
            groupId
        });

        const mapLanguageToHighlightJs = (language: string) => {
            const languageMap: { [key: string]: string } = {
                'C++': 'cpp',
                Java: 'java',
                Python: 'python',
                Python3: 'python',
                C: 'c',
                'C#': 'csharp',
                JavaScript: 'js',
                TypeScript: 'ts',
                PHP: 'php',
                Swift: 'swift',
                Kotlin: 'kt',
                Dart: 'dart',
                Go: 'go',
                Ruby: 'ruby',
                Scala: 'scala',
                Rust: 'rust',
                Erlang: 'erlang',
                Elixer: 'elixer'
            };
            return languageMap[language] || language;
        };

        try {
            const group = new Group();
            const groupInfo = await group.setGroup({
                key: '_id',
                value: groupId
            });

            const result = await Answer.findFeaturedQuestionResultsByGroup({
                groupInfo
            });

            const highlightCode = (answers: AnswerListEntry[]) => {
                return answers.map((answer) => {
                    const language = mapLanguageToHighlightJs(answer.language);
                    answer.code = hljs.highlight(answer.code, {
                        language
                    }).value;
                    return answer;
                });
            };

            const answers = highlightCode(result.answers);

            return res.render('Answers/group-answers', {
                answers,
                questionInfo: result.questionInfo,
                groupInfo
            });
        } catch (error) {
            return res.render('Answer/group-answers-error');
        }
    }
};
export default answers;
