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
});
