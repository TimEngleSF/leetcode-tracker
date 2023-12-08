import MongoDb, { Collection, Db, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection';
import { GroupDocument } from '../types/groupTypes';
import Filter from 'bad-words';

import { injectDb } from './helpers/injectDb';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import Question from './Question';
import { sanitizeId } from './helpers/utility';
import User from './User';

import { AnswerDocument, AnswerListEntry } from '../types/answer-types';
import { QuestionInfoDocument } from '../types/questionTypes';

export let answerCollection: Collection<Partial<AnswerDocument>>;
export const assignAnswerCollection = async () => {
    if (!answerCollection && process.env.NODE_ENV !== 'test') {
        answerCollection = await getCollection<Partial<GroupDocument>>(
            'answers'
        );
    }
};

class Answer {
    answerInfo: AnswerDocument | null;

    constructor() {
        this.answerInfo = null;
    }

    static injectDb(db: Db) {
        if (process.env.NODE_ENV === 'test') {
            answerCollection = injectDb(db, 'answers');
        }
    }

    async create({
        questId,
        code
    }: Omit<AnswerDocument, '_id'>): Promise<ObjectId> {
        questId = sanitizeId(questId);

        try {
            const questionDocument = await Question.getQuestion(questId);
            const userDocument = await User.getById(questionDocument.userId);
            const result = await answerCollection.insertOne({
                questId,
                userId: questionDocument.userId,
                name: `${userDocument?.firstName} ${userDocument?.lastInit}.`,
                code: `\n${code.trim()}`,
                created: new Date()
            });
            if (!result.acknowledged) {
                throw createExtendedError({
                    message: 'There was an error adding the answer code',
                    statusCode: 500
                });
            }
            return result.insertedId;
        } catch (error: any) {
            if (!error.statusCode) {
                throw createExtendedError({
                    message: `There was an error adding the answer code: ${error.message}`,
                    statusCode: 500
                });
            } else {
                throw error;
            }
        }
    }

    async set({ answerId }: { answerId: string | ObjectId }) {
        answerId = sanitizeId(answerId);

        try {
            const answerDocument = (await answerCollection.findOne({
                _id: answerId
            })) as AnswerDocument;

            if (!answerDocument) {
                throw createExtendedError({
                    message: 'Could not find answer document',
                    statusCode: 404
                });
            }
            this.answerInfo = answerDocument;
            return answerDocument;
        } catch (error: any) {
            if (!error.statusCode) {
                throw createExtendedError({
                    message: `There was an error adding the answer document: ${error.message}`,
                    statusCode: 500
                });
            } else {
                throw error;
            }
        }
    }

    static async findAnswersByUserId({
        userId
    }: {
        userId: string | ObjectId;
    }): Promise<AnswerDocument[]> {
        userId = sanitizeId(userId);

        try {
            const userAnswers = (await answerCollection
                .find({ userId })
                .toArray()) as AnswerDocument[];

            return userAnswers;
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error finding user's answers: ${error.message}`,
                statusCode: 500
            });
        }
    }

    static async findFeaturedQuestionResultsByGroup({
        groupInfo
    }: {
        groupInfo: GroupDocument;
    }): Promise<{
        questionInfo: QuestionInfoDocument;
        answers: AnswerListEntry[];
    }> {
        const { featuredQuestion, featuredQuestionCreated, members } =
            groupInfo;
        try {
            const pipeline = [
                {
                    $match: {
                        userId: {
                            $in: members
                        },
                        created: {
                            $gte: featuredQuestionCreated
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'questId',
                        foreignField: '_id',
                        as: 'questionData'
                    }
                },
                {
                    $unwind: {
                        path: '$questionData',
                        includeArrayIndex: 'string',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $sort: {
                        created: -1
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        mostRecentDocument: { $first: '$$ROOT' }
                    }
                },
                {
                    $replaceRoot: { newRoot: '$mostRecentDocument' }
                },
                {
                    $project: {
                        name: 1,
                        code: 1,
                        created: 1,
                        language: '$questionData.language',
                        passed: '$questionData.passed',
                        speed: '$questionData.speed'
                    }
                }
            ];

            const answers = (await answerCollection
                .aggregate(pipeline)
                .toArray()) as AnswerListEntry[];

            const questionInfo = await Question.getQuestionInfo(
                featuredQuestion as number
            );
            console.log(answers);
            return { questionInfo, answers };
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error getting members' code for featured question: ${error.message}`,
                statusCode: 500
            });
        }
    }
}

export default Answer;
