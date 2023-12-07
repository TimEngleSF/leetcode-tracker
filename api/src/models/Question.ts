import { Collection, ObjectId, Db } from 'mongodb';
import { getCollection } from '../db/connection';
import {
    NewQuestion,
    QuestionInfoDocument,
    QuestionDocument,
    QuestionByUserIdQueryResult,
    GetGeneralLeaderboardQuery,
    GetQuestionLeaderboardQueryResult,
    QuestionLeaderboardUserData
} from '../types/questionTypes';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import { injectDb } from './helpers/injectDb';
import { convertDaysToMillis } from './helpers/questionHelpers';
import User from './User';
import { UserDocument } from '../types';
import Group from './Group';

export let questionCollection: Collection<Partial<QuestionDocument>>;
export let questionInfoCollection: Collection<QuestionInfoDocument>;

export const assignQuestionCollections = async () => {
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

const Question = {
    injectDb: (db: Db) => {
        if (process.env.NODE_ENV === 'test') {
            questionCollection = injectDb<Partial<QuestionDocument>>(
                db,
                'questions'
            );
            questionInfoCollection = injectDb<QuestionInfoDocument>(
                db,
                'questionData'
            );
        }
    },
    addQuestion: async (
        questionData: NewQuestion
    ): Promise<QuestionDocument> => {
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
            userId: transformedUserId
        };

        try {
            const addResult = await questionCollection.insertOne(
                transformedQuestionData
            );
            if (!addResult.acknowledged) {
                throw new Error('Insertion not acknowledged');
            }
            const questionData = (await questionCollection.findOne({
                _id: addResult.insertedId
            })) as QuestionDocument;
            if (!questionData) {
                throw createExtendedError({
                    message: 'There was an error finding the question info',
                    statusCode: 500
                });
            }
            return questionData;
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
                _id: questId
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
                // istanbul ignore next
                const cursor = questionCollection.find(
                    { userId },
                    { projection: { _id: 0, username: 0, userId: 0 } }
                );

                // istanbul ignore next

                result = await cursor.toArray();
            } else {
                const cursor = questionCollection.find(
                    { userId, questNum: question },
                    {
                        projection: {
                            _id: 0,
                            userId: 0,
                            username: 0,
                            questNum: 0
                        }
                    }
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
        const endOfRange = new Date(
            currentTime - convertDaysToMillis(endRange)
        );
        const startOfRange = new Date(
            currentTime - convertDaysToMillis(startRange)
        );

        try {
            const pipeline = [
                {
                    $match: {
                        userId: new ObjectId(userId),
                        // created: { $gte: endOfRange, $lte: startOfRange }
                        created: { $gte: endOfRange }
                    }
                },
                {
                    $group: {
                        _id: '$questNum',
                        earliestCompletion: { $min: '$created' },
                        latestCompletion: { $max: '$created' }
                    } // Group duplicates
                },
                {
                    $match: {
                        latestCompletion: { $lte: startOfRange }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $lookup: {
                        from: 'questionData',
                        localField: '_id',
                        foreignField: 'questId',
                        as: 'questionDetails'
                    }
                },
                { $unwind: '$questionDetails' },
                { $replaceRoot: { newRoot: '$questionDetails' } }
            ];

            const results = (await questionCollection
                .aggregate(pipeline)
                .toArray()) as QuestionInfoDocument[];

            return results;
        } catch (error: any) {
            const extendedError = new ExtendedError(
                `There was an error fetching review questions: ${error.message}`
            );
            extendedError.statusCode = 500;
            extendedError.stack = error.stack;
            throw extendedError;
        }
    },

    // Can get The leaderboard for all users or just users within a group
    getGeneralLeaderboard: async (
        userId: string | ObjectId,
        groupId?: string | ObjectId
    ): Promise<GetGeneralLeaderboardQuery> => {
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }

        let members;
        if (groupId) {
            // Fetch the group and its members to use to filter in the first $match stage
            if (typeof groupId === 'string') {
                groupId = new ObjectId(groupId);
            }
            const group = await Group.findGroupById(groupId);
            if (!group) {
                const error = createExtendedError({
                    message: 'Group not found',
                    statusCode: 404
                });
                throw error;
            }
            members = group.members;
        }

        try {
            const cursor = questionCollection.aggregate([
                // First, get the general leaderboard with ranks
                // match all passed
                {
                    $match: {
                        passed: true,
                        // if groupId exists then only get Questsions where the userId is in the array members.
                        ...(groupId && { userId: { $in: members } })
                    }
                },
                { $group: { _id: '$userId', passedCount: { $sum: 1 } } },
                { $match: { passedCount: { $gt: 0 } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
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
                                '$userInfo.lastInit',
                                '.'
                            ]
                        },
                        passedCount: 1,
                        lastActivity: '$userInfo.lastActivity'
                    }
                },
                { $sort: { passedCount: -1 } },
                // Store the complete leaderboard and add ranks
                {
                    $group: {
                        _id: null,
                        leaderboard: { $push: '$$ROOT' }
                    }
                },
                {
                    $addFields: {
                        leaderboardWithRank: {
                            $map: {
                                // map over leaderboard with rank
                                input: {
                                    $range: [0, { $size: '$leaderboard' }]
                                }, // input range is 0 to length of $leaderboard
                                as: 'index', // current value will be called index
                                in: {
                                    $mergeObjects: [
                                        { rank: { $add: ['$$index', 1] } }, // get the users rank by adding current index by 1
                                        {
                                            $arrayElemAt: [
                                                '$leaderboard',
                                                '$$index'
                                            ]
                                        } //merge new rank field with the object at the current index
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        userResult: {
                            $first: {
                                $filter: {
                                    input: '$leaderboardWithRank',
                                    as: 'item',
                                    cond: { $eq: ['$$item.userId', userId] }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        leaderboardResult: '$leaderboardWithRank',
                        userResult: 1
                    }
                }
            ]);
            const [result] = await cursor.toArray();

            if (!result) {
                const error = createExtendedError({
                    message: `No users ${
                        groupId ? 'in this group' : ''
                    } have added questions`,
                    statusCode: 404
                });
                throw error;
            }

            // Create placeholder userResults if user has not yet added any questions to the db
            let loggedInUserData;
            if (!result.userResult) {
                const document = (await User.getById(userId)) as UserDocument;
                loggedInUserData = {
                    userId: userId,
                    name: `${document.firstName} ${document.lastInit}`,
                    passedCount: 0,
                    rank: null,
                    lastActivity: document.lastActivity
                };
            }
            return {
                leaderboardResult: result.leaderboardResult,
                userResult: result.userResult
                    ? result.userResult
                    : loggedInUserData
            };
        } catch (error: any) {
            if (!error.statusCode) {
                const extendedError = new ExtendedError(
                    `There was an error getting the Leaderboard: ${error.message}`
                );
                extendedError.statusCode = 500;
                extendedError.stack = error.stack;
                throw extendedError;
            }
            throw error;
        }
    },

    getQuestionLeaderboard: async (
        userId: string | ObjectId,
        targetQuestion: number,
        sortBySpeed: boolean = true,
        groupId?: string | ObjectId
    ): Promise<GetQuestionLeaderboardQueryResult | string> => {
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }

        let members;
        if (groupId) {
            // Fetch the group and its members
            if (typeof groupId === 'string') {
                groupId = new ObjectId(groupId);
            }
            const group = await Group.findGroupById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            members = group.members;
        }

        try {
            await Question.getQuestionInfo(targetQuestion);
        } catch (error) {
            throw error;
        }

        const pipeline = [
            {
                $match: {
                    questNum: targetQuestion,
                    passed: true,
                    ...(groupId && { userId: { $in: members } })
                }
            },
            {
                $group: {
                    _id: '$userId',
                    minSpeed: { $min: '$speed' },
                    passedCount: { $sum: 1 }, // Count of passed documents for each user
                    documents: {
                        $push: {
                            speed: '$speed',
                            language: '$language',
                            created: '$created'
                        }
                    }
                }
            },
            {
                $project: {
                    minSpeed: 1,
                    passedCount: 1,
                    document: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: '$documents',
                                    as: 'doc',
                                    cond: { $eq: ['$$doc.speed', '$minSpeed'] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
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
                            '$userInfo.lastInit',
                            '.'
                        ]
                    },
                    minSpeed: 1,
                    passedCount: 1,
                    mostRecent: '$document.created',
                    language: '$document.language'
                }
            },
            { $sort: sortBySpeed ? { minSpeed: 1 } : { passedCount: -1 } },
            { $group: { _id: null, leaderboard: { $push: '$$ROOT' } } },
            {
                $addFields: {
                    leaderboardWithRank: {
                        $map: {
                            input: { $range: [0, { $size: '$leaderboard' }] },
                            as: 'index',
                            in: {
                                $mergeObjects: [
                                    { rank: { $add: ['$$index', 1] } },
                                    {
                                        $arrayElemAt: [
                                            '$leaderboard',
                                            '$$index'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    userResult: {
                        $first: {
                            $filter: {
                                input: '$leaderboardWithRank',
                                as: 'item',
                                cond: { $eq: ['$$item.userId', userId] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    leaderboardResult: '$leaderboardWithRank',
                    userResult: '$userResult',
                    _id: 0
                }
            }
        ];

        try {
            const [result] = (await questionCollection
                .aggregate(pipeline)
                .toArray()) as GetQuestionLeaderboardQueryResult[];
            // If there are no submissions for this question return this string to display
            if (!result) {
                return 'No one has added their results for this question. You could be first!';
            }

            // If there is data for this question
            let loggedInUserData;
            if (result.userResult === undefined) {
                const document = (await User.getById(userId)) as UserDocument;
                loggedInUserData = {
                    userId: userId,
                    name: `${document.firstName} ${document.lastInit}`,
                    passedCount: 0,
                    rank: null,
                    minSpeed: null,
                    mostRecent: null
                };
            }

            return {
                leaderboardResult: result.leaderboardResult,
                userResult: result.userResult
                    ? result.userResult
                    : (loggedInUserData as QuestionLeaderboardUserData)
            };
        } catch (error: any) {
            const extendedError = new ExtendedError(
                `There was an error getting the Leaderboard: ${error.message}`
            );
            extendedError.statusCode = 500;
            extendedError.stack = error.stack;
            throw extendedError;
        }
    }
};
export default Question;
