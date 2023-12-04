import { Db, MongoClient, Collection, ObjectId, FindCursor } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

import { closeDb } from '../../../db/connection';
import { UserDocument } from '../../../types/userTypes';
import { ExtendedError } from '../../../errors/helpers';
import Question from '../../../models/Question';
import { createMockDb } from '../../helpers';
import User from '../../../models/User';
import Group, { groupCollection } from '../../../models/Group';
import { GroupDocument } from '../../../types/groupTypes';
import dummyUsersObject, { DummyUser } from '../../dummy-users';

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

const getRandomDummyUserIndex = (typeOfUser: 'main' | 'withToken'): number => {
    const max = dummyUsersObject[typeOfUser].length;
    return Math.floor(Math.random() * max);
};

describe('Group Model', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let uri: string;
    const dummyUsers = dummyUsersObject as {
        main: DummyUser[];
        withToken: DummyUser[];
    };

    let mainDummyUser = dummyUsers.main[0];
    let currMainDummyUser: DummyUser;
    let currWithTokenDummyUser;

    let group;
    let newGroup: GroupDocument;
    let createdGroup: GroupDocument;
    let createdGroupPasscode: string;

    beforeAll(async () => {
        ({ mongoServer, client, db, uri } = await createMockDb());
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

    describe('create', () => {
        let group;
        let sut: Function;
        beforeAll(() => {
            group = new Group();
            sut = group.create.bind(group);
        });
        const groupName = faker.company.name();
        const adminId = mainDummyUser._id;
        const passCode = faker.string.alpha(6).toLowerCase();
        createdGroupPasscode = passCode;

        it('should return a GroupDocument if a group is created successfully', async () => {
            const actual = await sut({
                name: groupName,
                adminId,
                open: false,
                passCode
            });

            createdGroup = actual;
            const expected = {
                _id: actual._id,
                name: groupName.toLowerCase(),
                displayName: groupName,
                members: [mainDummyUser._id],
                admins: [mainDummyUser._id],
                featuredQuestion: null,
                passCode,
                open: false
            };
            expect(actual).toEqual(expected);
        });
    });

    describe('setGroup', () => {
        let group;
        let sut: Function;
        let groupId: ObjectId;
        beforeAll(() => {
            group = new Group();
            sut = group.setGroup.bind(group);
            groupId = createdGroup._id;
        });

        it("should set a the group instance's groupInfo to a Group Document based on _id", async () => {
            const expected = createdGroup;
            const actual = await sut({ key: '_id', value: groupId });
            expect(actual).toEqual(expected);
        });
    });

    describe('getMembersInfo', () => {
        let group;
        let sut: Function;
        let groupId: ObjectId;
        const addedUser = dummyUsers.main[1];
        beforeAll(async () => {
            groupId = createdGroup._id;
            group = new Group();
            await group.setGroup({ key: '_id', value: groupId });
            await group.addMember(addedUser._id, createdGroupPasscode);
            sut = group.getMembersInfo.bind(group);
        });

        it("should return an array of it's members info", async () => {
            const actual = await sut(mainDummyUser._id);
            const expected = [
                {
                    firstName: mainDummyUser.firstName,
                    lastInit: mainDummyUser.lastInit,
                    username: mainDummyUser.displayUsername,
                    lastActivity: mainDummyUser.lastActivity
                },
                {
                    firstName: addedUser.firstName,
                    lastInit: addedUser.lastInit,
                    username: addedUser.displayUsername,
                    lastActivity: addedUser.lastActivity
                }
            ];

            expect(actual).toEqual(expected);
        });
    });
});
