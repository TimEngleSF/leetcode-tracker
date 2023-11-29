import { Db, MongoClient, Collection, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';

import { closeDb } from '../../../db/connection';
import { UserDocument } from '../../../types/userTypes';
import { ExtendedError } from '../../../errors/helpers';
import { createMockDb } from '../../helpers';
import dummyUsersObject from '../../dummy-users';

import Question from '../../../models/Question';
import User from '../../../models/User';
import {
    GeneralLeaderboardEntry,
    GetGeneralLeaderboardQuery,
    GetQuestionLeaderboardQueryResult,
    QuestionDocument,
    QuestionInfoDocument,
    QuestionLeaderboardEntry
} from '../../../types/questionTypes';

const mocks = {
    throwError: {
        findOne: () =>
            jest
                .spyOn(Collection.prototype, 'findOne')
                .mockImplementation(() => {
                    throw new Error('Simulated Error');
                }),
        find: () =>
            jest.spyOn(Collection.prototype, 'find').mockImplementation(() => {
                throw new Error('Simulated Error');
            }),
        findOneAndUpdate: () =>
            jest
                .spyOn(Collection.prototype, 'findOneAndUpdate')
                .mockImplementation(() => {
                    throw new Error('Simulated Error');
                }),
        insertOne: () =>
            jest
                .spyOn(Collection.prototype, 'insertOne')
                .mockImplementation(() => {
                    throw new Error('Simulated Error');
                }),
        updateOne: () =>
            jest
                .spyOn(Collection.prototype, 'updateOne')
                .mockImplementation(() => {
                    throw new Error('Simulated Error');
                }),
        deleteOne: () =>
            jest
                .spyOn(Collection.prototype, 'deleteOne')
                .mockImplementation(() => {
                    throw new Error('Simulated Error');
                }),
        withStatusCode: {
            findOne: (statusCode: number) => {
                const error = new ExtendedError('Simulated Error');
                error.statusCode = statusCode;
                return jest
                    .spyOn(Collection.prototype, 'findOne')
                    .mockImplementation(() => {
                        throw error;
                    });
            }
        }
    },
    resolveNull: {
        findOne: () =>
            jest.spyOn(Collection.prototype, 'findOne').mockResolvedValue(null),
        findOneAndUpdate: () =>
            jest
                .spyOn(Collection.prototype, 'findOneAndUpdate')
                .mockResolvedValue(null)
    },
    resolvesFalse: {
        insertOne: () =>
            jest.spyOn(Collection.prototype, 'insertOne').mockResolvedValue({
                acknowledged: false,
                insertedId: new ObjectId()
            })
    }
};

type ErrorTestCase = [Function, string, number];

const getRandomDummyUserIndex = (typeOfUser: 'main' | 'withToken'): number => {
    const max = dummyUsersObject[typeOfUser].length;
    return Math.floor(Math.random() * max);
};

const generateNewUserQuestionPayload = (
    userId: ObjectId | 'string',
    username: string,
    questNum: number,
    date: { fromDaysAgo: number; toDaysAgo: number }
) => {
    if (date.fromDaysAgo < date.toDaysAgo) {
        throw new Error(
            'date.fromDays ago must be greater than date.toDaysAgo'
        );
    }
    let payloadPassed = faker.datatype.boolean();
    const generateDate = (daysAgo: number) =>
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - daysAgo
        );
    return {
        userId,
        username,
        questNum,
        passed: payloadPassed,
        speed: payloadPassed
            ? faker.number.int({ min: 50, max: 4000 })
            : undefined,
        created: faker.date.between({
            from: generateDate(date.fromDaysAgo),
            to: generateDate(date.toDaysAgo)
        })
    };
};

const addQuestionToDb = async (newQuestion: {
    userId: string | ObjectId;
    username: string;
    questNum: number;
    created: Date;
    speed: number | undefined;
    passed: boolean;
}) => {
    await Question.addQuestion({ ...newQuestion });
};

interface CreateUserPayload {
    displayUsername: string;
    email: string;
    hashedPass: string;
    firstName: string;
    lastInit: string;
    verificationToken: string;
}

interface DummyUser {
    _id: ObjectId;
    username: string;
    displayUsername: string;
    email: string;
    password: string;
    firstName: string;
    lastInit: string;
    status: string;
    questions: [];
    groups: string[];
    admins: string[];
    verificationToken: string;
    passwordToken: string;
    lastActivity: Date;
}

const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

describe('Question Model', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;

    let db: Db;
    let uri: string;
    const dummyUsers = dummyUsersObject as {
        main: DummyUser[];
        withToken: DummyUser[];
    };
    let currMainDummyUser: DummyUser;
    let currWithTokenDummyUser;
    let questNum: number;
    let randBoolean: boolean;
    let speed: number | undefined;
    let date: Date;

    const defaultQuestionId = new ObjectId('65532cac49e74c6155215c5b');

    beforeAll(async () => {
        ({ mongoServer, client, db, uri } = await createMockDb());
        questNum = faker.number.int({ min: 1, max: 2400 });
        randBoolean = faker.datatype.boolean();
        speed = randBoolean
            ? faker.number.int({ min: 50, max: 4000 })
            : undefined;

        date = faker.date.anytime();

        currMainDummyUser = dummyUsers.main[getRandomDummyUserIndex('main')];
        currWithTokenDummyUser =
            dummyUsers.withToken[getRandomDummyUserIndex('withToken')];
    });

    afterAll(async () => {
        await closeDb();
        await client.close();
        await mongoServer.stop();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('add question', () => {
        const sut = Question.addQuestion;
        const errorTestCases: ErrorTestCase[] = [
            [mocks.resolvesFalse.insertOne, 'Insertion not acknowledged', 500],
            [
                mocks.throwError.insertOne,
                'There was an error adding the question result: Simulated Error',
                500
            ]
        ];
        it("should add a user's question data - userId as string", async () => {
            const actual = await sut({
                userId: currMainDummyUser._id.toHexString(),
                passed: randBoolean,
                speed: speed,
                questNum,
                username: currMainDummyUser.username,
                created: date
            });
            const expected = true;
            expect(actual).toBe(expected);
        });
        it("should add a user's question data - userId as ObjectId", async () => {
            const actual = await sut({
                userId: currMainDummyUser._id,
                passed: randBoolean,
                speed: speed,
                questNum,
                username: currMainDummyUser.username,
                created: date
            });
            const expected = true;
            expect(actual).toBe(expected);
        });
        it.each(errorTestCases)(
            'should throw an error with the correct message and status code',
            async (mockSetup, expectedMessage, expectedStatusCode) => {
                mockSetup();

                let didNotThrow = false;
                try {
                    const actual = await sut({
                        userId: currMainDummyUser._id,
                        passed: randBoolean,
                        speed: speed,
                        questNum,
                        username: currMainDummyUser.username,
                        created: new Date()
                    });
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ExtendedError);
                    expect(error.message).toContain(`${expectedMessage}`);
                    expect(error.statusCode).toBe(expectedStatusCode);
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            }
        );
    });

    describe('getQuestion', () => {
        const sut = Question.getQuestion;
        const testQuestionData = [
            {
                _id: new ObjectId('65532cac49e74c6155215c5b'),
                expected: {
                    _id: new ObjectId('65532cac49e74c6155215c5b'),
                    userId: new ObjectId('65532c3749e74c6155215c5a'),
                    username: 'Tester',
                    questNum: 33,
                    passed: true,
                    speed: 384,
                    created: new Date('2023-11-14T08:15:40.719Z')
                }
            },
            {
                _id: new ObjectId('65532df8b3bfb5f3c3626560'),
                expected: {
                    _id: new ObjectId('65532df8b3bfb5f3c3626560'),
                    userId: new ObjectId('65532dc5b3bfb5f3c362651a'),
                    username: 'Sm0keMan',
                    questNum: 2,
                    passed: true,
                    speed: 142,
                    created: new Date('2023-11-14T08:21:12.867Z')
                }
            },
            {
                _id: new ObjectId('65533b06a56c2a872263d343'),
                expected: {
                    _id: new ObjectId('65533b06a56c2a872263d343'),
                    userId: new ObjectId('65532e27b3bfb5f3c36265b1'),
                    username: 'PuppyGirl',
                    questNum: 69,
                    passed: true,
                    speed: 71,
                    created: new Date('2023-11-14T09:16:54.076Z')
                }
            }
        ];
        const errorTestCases: ErrorTestCase[] = [
            [mocks.resolveNull.findOne, 'No question found', 404],
            [mocks.throwError.findOne, 'Simulated Error', 500]
        ];
        it.each(testQuestionData)(
            'should return the correct user question date by question _id as an ObjectId',
            async ({ _id, expected }) => {
                const actual = await sut(_id);
                expect(actual).toEqual(expected);
            }
        );
        it.each(testQuestionData)(
            'should return the correct user question date by question _id as string',
            async ({ _id, expected }) => {
                const actual = await sut(_id.toHexString());
                expect(actual).toEqual(expected);
            }
        );
        it.each(errorTestCases)(
            'should throw an error with the correct message and status code',
            async (mockSetup, expectedMessage, expectedStatusCode) => {
                mockSetup();

                let didNotThrow = false;
                try {
                    const actual = await sut(defaultQuestionId);
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ExtendedError);
                    expect(error.message).toContain(`${expectedMessage}`);
                    expect(error.statusCode).toBe(expectedStatusCode);
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            }
        );
    });

    describe('getQuestionInfo', () => {
        const sut = Question.getQuestionInfo;
        const testQuestionInfoData = [
            {
                questId: 4,
                expected: {
                    _id: new ObjectId('6529aa8feb5e336742cf7ced'),
                    title: 'Median of Two Sorted Arrays',
                    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
                    diff: 'Hard',
                    questId: 4
                }
            },
            {
                questId: 1,
                expected: {
                    _id: new ObjectId('6529aa8feb5e336742cf7cea'),
                    title: 'Two Sum',
                    url: 'https://leetcode.com/problems/two-sum/',
                    diff: 'Easy',
                    questId: 1
                }
            },
            {
                questId: 5,
                expected: {
                    _id: new ObjectId('6529aa8feb5e336742cf7cee'),
                    title: 'Longest Palindromic Substring',
                    url: 'https://leetcode.com/problems/longest-palindromic-substring/',
                    diff: 'Medium',
                    questId: 5
                }
            }
        ];

        const errorTestCases: ErrorTestCase[] = [
            [
                mocks.resolveNull.findOne,
                'Question does not exist in the database',
                404
            ],
            [mocks.throwError.findOne, 'Simulated Error', 500]
        ];

        it.each(testQuestionInfoData)(
            'should return the correct questionInfo document',
            async ({ questId, expected }) => {
                const actual = await sut(questId);
                expect(actual).toEqual(expected);
            }
        );

        it.each(errorTestCases)(
            'should throw an error with the correct message and status code',
            async (mockSetup, expectedMessage, expectedStatusCode) => {
                mockSetup();

                let didNotThrow = false;
                try {
                    const actual = await sut(2);
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ExtendedError);
                    expect(error.message).toContain(`${expectedMessage}`);
                    expect(error.statusCode).toBe(expectedStatusCode);
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            }
        );
    });

    describe('getQuestionsByUser', () => {
        const sut = Question.getQuestionsByUser;
        const questId = 22;
        const users = [
            new ObjectId('65532c3749e74c6155215c5a'),
            new ObjectId('65532ce949e74c6155215cf1'),
            new ObjectId('65532dc5b3bfb5f3c362651a')
        ];
        it.each(users)(
            "should return an array of user's questions by their userId as an ObjectId",
            async (user) => {
                const actual = await sut(user, questId);
                console.log(actual);
                actual.forEach((questionInfo) => {
                    expect(
                        typeof questionInfo.passed === 'boolean'
                    ).toBeTruthy();
                    expect(
                        typeof questionInfo.speed === 'number' ||
                            typeof questionInfo.speed === 'undefined'
                    ).toBeTruthy();
                    expect(questionInfo.created).toBeInstanceOf(Date);
                });
            }
        );
        it('should throw an instance of ExtendedError with a status code of 500 if an error occurs during query', async () => {
            mocks.throwError.find();
            let didNotThrow = false;
            try {
                const actual = await sut(users[0], questId);
                didNotThrow = true;
            } catch (error: any) {
                expect(error).toBeInstanceOf(ExtendedError);
                expect(error.message).toContain('Simulated Error');
                expect(error.statusCode).toBe(500);
            }

            if (didNotThrow) {
                throw new Error(
                    'Expected function to throw an ExtendedError, but it did not throw'
                );
            }
        });
    });
});
