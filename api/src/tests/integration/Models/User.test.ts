import { Db, MongoClient, Collection, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import User, {
    assignUserCollection,
    userCollection
} from '../../../models/User';
import { closeDb } from '../../../db/connection';
import { UserDocument } from '../../../types/userTypes';
import { ExtendedError } from '../../../errors/helpers';
import { createMockDb } from '../../helpers';
import { dummyUsers } from '../../dummy-users';

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
    }
};

const getRandomDummyUserIndex = (typeOfUser: 'main' | 'withToken'): number => {
    const max = dummyUsers[typeOfUser].length;
    return Math.floor(Math.random() * max);
};

interface CreateUserPayload {
    displayUsername: string;
    email: string;
    hashedPass: string;
    firstName: string;
    lastInit: string;
    verificationToken: string;
}

const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

describe('User Model', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let uri: string;
    let newUser: UserDocument;
    let findOneMock;
    let findOneAndUpdateMock;
    let updateOneMock;
    let deleteOneMock;

    beforeAll(async () => {
        ({ mongoServer, client, db, uri } = await createMockDb());
    });

    afterAll(async () => {
        await closeDb();
        await client.close();
        await mongoServer.stop();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('get methods test suite', () => {
        describe('getUser', () => {
            const sut = User.getUser;
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id,
                    expected: user
                }))
            )(
                'should fetch a document by _id as an ObjectId with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut('_id', input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id.toHexString(),
                    expected: user
                }))
            )(
                'should fetch a document by _id as string with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut('_id', input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.username,
                    expected: user
                }))
            )(
                'should fetch a document by username with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut('username', input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.email,
                    expected: user
                }))
            )(
                'should fetch a document by email with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut('email', input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError when the caught error has no status code', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut('_id', dummyUsers.main[0]._id);
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
            it('should throw an instance of ExtendedError with the correct status code if an error with a status code is thrown', async () => {
                findOneMock = mocks.throwError.withStatusCode.findOne(400);
                let didNotThrow = false;

                try {
                    await sut('_id', dummyUsers.main[0]._id);
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ExtendedError);
                    expect(error.message).toContain('Simulated Error');
                    expect(error.statusCode).toBe(400);
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            });
        });
        describe('getById', () => {
            const sut = User.getById;
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id,
                    expected: user
                }))
            )(
                'should fetch a document by _id as an ObjectId with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id.toHexString(),
                    expected: user
                }))
            )(
                'should fetch a document by _id as a string with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError if an error occurs during query', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut(
                        dummyUsers.main[getRandomDummyUserIndex('main')]._id
                    );
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
        describe('getByUsername', () => {
            const sut = User.getByUsername;
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.username.toLowerCase(),
                    expected: user
                }))
            )(
                'should fetch a document by username in lowercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.username.toUpperCase(),
                    expected: user
                }))
            )(
                'should fetch a document by username in uppercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: '    ' + user.username + '     ',
                    expected: user
                }))
            )(
                'should fetch a document by username including whitespaces with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError if an error occurs during query', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut(
                        dummyUsers.main[getRandomDummyUserIndex('main')]
                            .username
                    );
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
        describe('getByEmail', () => {
            const sut = User.getByEmail;
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.email.toLowerCase(),
                    expected: user
                }))
            )(
                'should fetch a document by email in lowercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.email.toUpperCase(),
                    expected: user
                }))
            )(
                'should fetch a document by email in uppercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: '    ' + user.email + '     ',
                    expected: user
                }))
            )(
                'should fetch a document by email including whitespaces with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError if an error occurs during query', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut(
                        dummyUsers.main[getRandomDummyUserIndex('main')].email
                    );
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
        describe('getByVerificationToken', () => {
            const sut = User.getByVerificationToken;
            it.each(
                // prettier-ignore
                dummyUsers.withToken.filter((user) => user.verificationToken.length > 0).map((user) => ({
                        input: user.verificationToken,
                        expected: user
                    }))
            )(
                'should fetch a document by verificationToken with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError if an error occurs during query', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut(
                        dummyUsers.withToken[
                            getRandomDummyUserIndex('withToken')
                        ].verificationToken
                    );
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
        describe('getByPasswordToken', () => {
            const sut = User.getByPasswordToken;
            it.each(
                // prettier-ignore
                dummyUsers.withToken.filter((user)  => user.passwordToken).map((user) => ({
                        input: user.passwordToken,
                        expected: user
                    }))
            )(
                'should fetch a document by verificationToken with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await sut(input);
                    expect(actual).toEqual(expected);
                }
            );
            it('should throw an instance of ExtendedError if an error occurs during query', async () => {
                findOneMock = mocks.throwError.findOne();
                let didNotThrow = false;

                try {
                    await sut(
                        dummyUsers.withToken[
                            getRandomDummyUserIndex('withToken')
                        ].passwordToken
                    );
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

    describe('create method test suite', () => {
        const sut = User.create;
        let createdUser: UserDocument;
        let errorUser: UserDocument;
        let createUserPayload: CreateUserPayload;

        const sanitizedUserPayload = {
            displayUsername: '    TeST    ',
            email: '  Test@Email.com   ',
            hashedPass: 'hashedPass',
            firstName: '  first  ',
            lastInit: 'n',
            verificationToken: 'someToken'
        };

        beforeEach(async () => {
            let createdUserPass = await bcrypt.hash(
                faker.internet.password(),
                12
            );
            createUserPayload = {
                displayUsername: faker.internet.userName(),
                email: faker.internet.email(),
                hashedPass: createdUserPass,
                firstName: faker.person.firstName(),
                lastInit: faker.string.alpha(1),
                verificationToken: 'someToken'
            };
            createdUser = await sut(createUserPayload);
        });

        afterEach(async () => {
            await User.deleteById(createdUser._id);
        });

        it('should return a new user object with the correct properties', () => {
            const actual = createdUser;
            expect(actual._id).toBeInstanceOf(ObjectId);
            expect(actual.email).toBe;

            expect(createdUser).toEqual(
                expect.objectContaining({
                    _id: expect.any(ObjectId),
                    username: expect.any(String),
                    displayUsername: expect.any(String),
                    email: expect.any(String),
                    firstName: expect.any(String),
                    lastInit: expect.any(String),
                    password: expect.any(String),
                    status: expect.stringContaining('pending' || 'verified'),
                    verificationToken: expect.any(String),
                    passwordToken: expect.any(String),
                    groups: expect.any(Array),
                    admins: expect.any(Array),
                    questions: expect.any(Array),
                    lastActivity: expect.any(Date)
                })
            );
        });
        it('should sanitize the input data', async () => {
            const actual = await sut(sanitizedUserPayload);
            const expected = {
                username: sanitizedUserPayload.displayUsername
                    .toLowerCase()
                    .trim(),
                email: sanitizedUserPayload.email.toLowerCase().trim(),
                firstName: 'First',
                lastInit: 'N',
                verificationToken: sanitizedUserPayload.verificationToken
            };
            expect(actual._id).toBeInstanceOf(ObjectId);
            expect(actual.username).toBe(expected.username);
            expect(actual.email).toBe(expected.email);
            expect(actual.firstName).toBe(expected.firstName);
            expect(actual.lastInit).toBe(expected.lastInit);
            expect(actual.verificationToken).toBe(expected.verificationToken);
            expect(actual.admins).toBeInstanceOf(Array);
            expect(actual.groups).toBeInstanceOf(Array);
            expect(actual.lastActivity).toBeInstanceOf(Date);
            expect(actual.passwordToken).toBe('');
            expect(actual.status).toBe('pending');
        });
        it('should throw an error if created user cannot be located by _id', async () => {
            findOneMock = mocks.resolveNull.findOne();
            let didNotThrow = false;

            try {
                await sut(createUserPayload);
                didNotThrow = true;
            } catch (error: any) {
                expect(error).toBeInstanceOf(ExtendedError);
                expect(error.statusCode).toBe(500);
            }

            if (didNotThrow) {
                throw new Error(
                    'Expected function to throw an ExtendedError, but it did not throw'
                );
            }
        });
        it('should throw an instance of ExtendedError with the correct status code if an error with a status code is thrown', async () => {
            findOneMock = mocks.throwError.findOne();
            let didNotThrow = false;

            try {
                await sut(createUserPayload);
                didNotThrow = true;
            } catch (error: any) {
                expect(error).toBeInstanceOf(ExtendedError);
                expect(error.message).toContain(
                    'Database Error: There was an error creating user'
                );
                expect(error.statusCode).toBe(500);
            }

            if (didNotThrow) {
                throw new Error(
                    'Expected function to throw an ExtendedError, but it did not throw'
                );
            }
        });
    });

    describe('update methods test suite', () => {
        describe('update', () => {
            const sut = User.update;
            let updatedValue: string;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            type UserUpdateTestCase = {
                key:
                    | 'password'
                    | 'username'
                    | 'email'
                    | 'verificationToken'
                    | 'passwordToken'
                    | 'lastActivity'
                    | 'firstName'
                    | 'lastInit'
                    | 'status';
                value: string | Date;
            };

            const updateTestCases: UserUpdateTestCase[] = [
                { key: 'username', value: faker.internet.userName() },
                { key: 'email', value: faker.internet.email() },
                { key: 'password', value: faker.internet.password() },
                { key: 'firstName', value: faker.person.firstName() },
                { key: 'lastInit', value: faker.string.alpha() },
                { key: 'status', value: 'verified' },
                {
                    key: 'verificationToken',
                    value: faker.string.alphanumeric(32)
                },
                { key: 'passwordToken', value: faker.string.alphanumeric(32) },
                { key: 'lastActivity', value: faker.date.anytime() }
            ];
            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });
            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it.each(updateTestCases)(
                'should a return a User Document with an updated value',
                async ({ key, value }) => {
                    await sut({
                        _id: createdUser._id.toHexString(),
                        key: key,
                        value
                    });
                    const actual = (await User.getById(
                        createdUser._id
                    )) as UserDocument;
                    expect(actual[key]).not.toBe(createdUser[key]);
                    expect(actual[key]).toStrictEqual(value);
                }
            );
            it('should throw an error if the updateOne returns null', async () => {
                findOneAndUpdateMock = mocks.resolveNull.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut({
                        _id: createdUser._id.toHexString(),
                        key: 'password',
                        value: 'afafasfa'
                    });
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(ExtendedError);
                    expect(error.message).toContain(
                        'Database Error: There was an error updating the user'
                    );
                    expect(error.statusCode).toBe(500);
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            });
        });
        describe('updatePassword', () => {
            const sut = User.updatePassword;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated password', async () => {
                const expected = faker.internet.password();
                await sut(createdUser._id, expected);
                const actual = await User.getById(createdUser._id);
                expect(actual?.password).not.toBe(createdUser.password);
                expect(actual?.password).toBe(expected);
                expect(actual).toEqual({ ...createdUser, password: expected });
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                findOneAndUpdateMock = mocks.throwError.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut(createdUser._id, faker.internet.password());
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
        describe('updateVerificationToken', () => {
            const sut = User.updateVerificationToken;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated verificationToken', async () => {
                const expected = faker.string.alphanumeric(32);
                await sut(createdUser._id, expected);
                const actual = await User.getById(createdUser._id);
                expect(actual?.verificationToken).not.toBe(
                    createdUser.verificationToken
                );
                expect(actual?.verificationToken).toBe(expected);
                expect(actual).toEqual({
                    ...createdUser,
                    verificationToken: expected
                });
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                const expected = faker.string.alphanumeric(32);

                findOneAndUpdateMock = mocks.throwError.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut(createdUser._id, expected);
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
        describe('updatePasswordToken', () => {
            const sut = User.updatePasswordToken;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated passwordToken', async () => {
                const expected = faker.string.alphanumeric(32);
                await sut(createdUser._id, expected);
                const actual = await User.getById(createdUser._id);

                expect(actual?.passwordToken).not.toBe(
                    createdUser.passwordToken
                );
                expect(actual?.passwordToken).toBe(expected);
                expect(actual).toEqual({
                    ...createdUser,
                    passwordToken: expected
                });
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                const expected = faker.string.alphanumeric(32);

                findOneAndUpdateMock = mocks.throwError.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut(createdUser._id, expected);
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
        describe('updateStatus', () => {
            const sut = User.updateStatus;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated status', async () => {
                const expected = 'verified';
                await sut(createdUser._id, expected);
                const actual = await User.getById(createdUser._id);

                expect(actual?.status).not.toBe(createdUser.status);
                expect(actual?.status).toBe(expected);
                expect(actual).toEqual({
                    ...createdUser,
                    status: expected
                });
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                const expected = 'pending';

                findOneAndUpdateMock = mocks.throwError.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut(createdUser._id, expected);
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
        describe('updateLastActivity', () => {
            const sut = User.updateLastActivity;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);

                await delay(50);
                await sut(createdUser._id);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated lastActivity', async () => {
                const actual = await User.getById(createdUser._id);

                expect(actual?.lastActivity).not.toStrictEqual(
                    createdUser.lastActivity
                );
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                findOneAndUpdateMock = mocks.throwError.findOneAndUpdate();
                let didNotThrow = false;

                try {
                    await sut(createdUser._id);
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
        describe('addGroup', () => {
            const sut = User.addGroup;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated lastActivity', async () => {
                const expected = new ObjectId();
                await sut({ userId: createdUser._id, groupId: expected });
                const actual = await User.getById(createdUser._id);

                expect(actual?.groups).not.toStrictEqual(createdUser.group);
                expect(actual?.groups).toContainEqual(expected);
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                updateOneMock = mocks.throwError.updateOne();
                let didNotThrow = false;

                try {
                    await sut({
                        userId: createdUser._id,
                        groupId: new ObjectId()
                    });
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.message).toContain('Simulated Error');
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            });
        });
        describe('addAdmin', () => {
            const sut = User.addAdmin;
            let createUserPayload: CreateUserPayload;
            let createdUser: UserDocument;

            beforeAll(async () => {
                let createdUserPass = await bcrypt.hash(
                    faker.internet.password(),
                    12
                );
                createUserPayload = {
                    displayUsername: faker.internet.userName(),
                    email: faker.internet.email(),
                    hashedPass: createdUserPass,
                    firstName: faker.person.firstName(),
                    lastInit: faker.string.alpha(1),
                    verificationToken: 'someToken'
                };
                createdUser = await User.create(createUserPayload);
            });

            afterAll(async () => {
                await User.deleteById(createdUser._id);
            });

            it('should a return a User Document with an updated lastActivity', async () => {
                const expected = new ObjectId();
                await sut({ adminId: createdUser._id, groupId: expected });
                const actual = await User.getById(createdUser._id);

                expect(actual?.admins).not.toStrictEqual(createdUser.admins);
                expect(actual?.admins).toContainEqual(expected);
            });
            it('should throw an instance of ExtendedError when an error occurs', async () => {
                updateOneMock = mocks.throwError.updateOne();
                let didNotThrow = false;

                try {
                    await sut({
                        adminId: createdUser._id,
                        groupId: new ObjectId()
                    });
                    didNotThrow = true;
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.message).toContain('Simulated Error');
                }

                if (didNotThrow) {
                    throw new Error(
                        'Expected function to throw an ExtendedError, but it did not throw'
                    );
                }
            });
        });
    });

    describe('delete method', () => {
        const sut = User.deleteById;
        const getMethod = User.getById;
        let createUserPayload: CreateUserPayload;
        let createdUser: UserDocument;

        beforeAll(async () => {
            let createdUserPass = await bcrypt.hash(
                faker.internet.password(),
                12
            );
            createUserPayload = {
                displayUsername: faker.internet.userName(),
                email: faker.internet.email(),
                hashedPass: createdUserPass,
                firstName: faker.person.firstName(),
                lastInit: faker.string.alpha(1),
                verificationToken: 'someToken'
            };
            createdUser = await User.create(createUserPayload);
        });

        it('should delete a user document by _id', async () => {
            let actual: UserDocument | null;
            actual = await getMethod(createdUser._id);
            expect(actual).not.toBeNull();
            await sut(createdUser._id.toHexString());
            actual = await getMethod(createdUser._id);
            expect(actual).toBeNull();
        });
        it('should throw an instance of ExtendedError when an error occurs', async () => {
            const expected = faker.string.alphanumeric(32);

            deleteOneMock = mocks.throwError.deleteOne();
            let didNotThrow = false;

            try {
                await sut(createdUser._id);
                didNotThrow = true;
            } catch (error: any) {
                expect(error).toBeInstanceOf(ExtendedError);
                expect(error.message).toContain(
                    'Database Error: There was an error deleting user'
                );
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
