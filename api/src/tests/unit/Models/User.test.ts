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

describe('User Model', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let uri: string;
    let newUser: UserDocument;

    beforeAll(async () => {
        // User.injectDb(db);
        ({ mongoServer, client, db, uri } = await createMockDb());

        // Question.

        // const newUserPass = await bcrypt.hash(faker.internet.password(), 12);
        // newUser = await User.create({
        //     displayUsername: faker.internet.userName(),
        //     email: faker.internet.email(),
        //     hashedPass: newUserPass,
        //     firstName: faker.person.firstName(),
        //     lastInit: faker.string.alpha(1),
        //     verificationToken: 'someToken'
        // });
    });

    afterAll(async () => {
        // User.deleteById(newUser._id);
        await closeDb();
        await client.close();
        await mongoServer.stop();
    });

    describe('get methods', () => {
        describe('getUser', () => {
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id,
                    expected: user
                }))
            )(
                'should fetch a document by _id with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getUser('_id', input);
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
                    const actual = await User.getUser('username', input);
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
                    const actual = await User.getUser('email', input);
                    expect(actual).toEqual(expected);
                }
            );
        });
        describe('getById', () => {
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user._id,
                    expected: user
                }))
            )(
                'should fetch a document by _id as an ObjectId with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getById(input);
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
                    const actual = await User.getById(input);
                    expect(actual).toEqual(expected);
                }
            );
        });
        describe('getByUsername', () => {
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.username.toLowerCase(),
                    expected: user
                }))
            )(
                'should fetch a document by username in lowercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getByUsername(input);
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
                    const actual = await User.getByUsername(input);
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
                    const actual = await User.getByUsername(input);
                    expect(actual).toEqual(expected);
                }
            );
        });
        describe('getByEmail', () => {
            it.each(
                dummyUsers.main.map((user, i) => ({
                    input: user.email.toLowerCase(),
                    expected: user
                }))
            )(
                'should fetch a document by email in lowercase with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getByEmail(input);
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
                    const actual = await User.getByEmail(input);
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
                    const actual = await User.getByEmail(input);
                    expect(actual).toEqual(expected);
                }
            );
        });
        describe('getByVerificationToken', () => {
            it.each(
                // prettier-ignore
                dummyUsers.withToken.filter((user) => user.verificationToken.length > 0).map((user) => ({
                        input: user.verificationToken,
                        expected: user
                    }))
            )(
                'should fetch a document by verificationToken with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getByVerificationToken(input);
                    expect(actual).toEqual(expected);
                }
            );
        });
        describe('getByPasswordToken', () => {
            it.each(
                // prettier-ignore
                dummyUsers.withToken.filter((user)  => user.passwordToken).map((user) => ({
                        input: user.passwordToken,
                        expected: user
                    }))
            )(
                'should fetch a document by verificationToken with the correct properties and values',
                async ({ input, expected }) => {
                    const actual = await User.getByPasswordToken(input);
                    expect(actual).toEqual(expected);
                }
            );
        });
    });
});
