import { Collection, Db, MongoClient, ObjectId, FindCursor } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import chaiHttp from 'chai-http';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { Server } from 'http';
import bcrypt from 'bcrypt';
// // @ts-ignore
// import log from 'why-is-node-running';

import { closeDb } from '../../../db/connection';
import { app, startServer } from '../../../app';
import User from '../../../models/User';
import { createMockDb } from '../../helpers';
import { UserDocument } from '../../../types';
import { ExtendedError } from '../../../errors/helpers';

const { expect } = chai;
chai.use(chaiHttp);

const chaiPostReq = async (
    url: string,
    reqBody: Object
): Promise<ChaiHttp.Response> => {
    const res = await chai
        .request(app)
        .post(url)
        .set('Content-Type', 'application/json')
        .send(reqBody);
    return res;
};

const stub = {
    error: {
        findOneStub: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'findOne')
                .throws(new Error('Simulated Error')),
        findStub: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'find')
                .throws(new Error('Simulated Error')),
        findOneAndUpdate: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'findOneAndUpdate')
                .throws(new Error('Simulated error')),
        insertOneStub: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'findOne')
                .throws(new Error('Simulated Error')),
        aggregateStub: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'aggregate')
                .throws(new Error('Simulated Error')),
        withStatusCode: {
            findOneStub: (): SinonStub => {
                const error = new ExtendedError('Simulated error');
                error.statusCode = 500;
                return sinon
                    .stub(Collection.prototype, 'findOne')
                    .throws(error);
            }
        }
    },
    null: {
        findOneStub: (): SinonStub =>
            sinon.stub(Collection.prototype, 'findOne').resolves(null),
        updateOneStub: (): SinonStub =>
            sinon.stub(Collection.prototype, 'findOneAndUpdate').resolves(null),
        insertOneStub: (): SinonStub =>
            sinon
                .stub(Collection.prototype, 'insertOne')
                .resolves({ insertedId: new ObjectId(), acknowledged: false }),
        findStub: () =>
            sinon.stub(Collection.prototype, 'find').returns({
                toArray: () => Promise.resolve([])
            } as unknown as FindCursor<Document>)
    },
    undefined: {
        aggregateStub: (): SinonStub =>
            sinon.stub(Collection.prototype, 'aggregate').resolves(undefined)
    }
};
const generateDummyUser = (verifiedStatus: boolean) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastInit: faker.string.alpha(1),
    verfied: verifiedStatus ? 'verfied' : 'pending',
    verificationToken: 'someToken',
    passwordToken: 'paswordToken',
    lastActivity: new Date()
});

describe('Auth controller', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let uri: string;
    let findOneStub: SinonStub;
    let newUser: UserDocument;
    let validAuthToken: string;
    let testServer: Server;
    let JWT_SECRET: string;

    before(async () => {
        ({ mongoServer, client, db, uri } = await createMockDb());
        if (!process.env.JWT_SECRET) {
            throw new Error();
        }

        JWT_SECRET = process.env.JWT_SECRET;

        testServer = await startServer();

        newUser = await User.create({
            displayUsername: faker.internet.userName(),
            email: faker.internet.email(),
            hashedPass: faker.internet.password(),
            firstName: faker.person.firstName(),
            lastInit: faker.string.alpha(1),
            verificationToken: 'someToken'
        });

        validAuthToken = jwt.sign(
            {
                userId: '65532e27b3bfb5f3c36265b1',
                email: 'lily@email.com',
                username: 'puppygirl'
            },
            process.env.JWT_SECRET
        );
    });

    after(async () => {
        await User.deleteById(newUser._id);
        await closeDb();
        await client.close();
        await mongoServer.stop();
        if (testServer) {
            await new Promise((resolve) => testServer.close(resolve));
        }
    });

    afterEach(() => {
        if (findOneStub) {
            findOneStub.restore();
        }
    });

    describe('get endpoints', () => {
        describe('getStatus', () => {
            it('should respond with code 200 and status property of "valid" if a valid authentication token is attached to authorization header', async () => {
                const res = await chai
                    .request(app)
                    .get('/status')
                    .set('Authorization', `Bearer ${validAuthToken}`);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', 'valid');
            });
            it('should respond with code 422 if there is no Authorization header', async () => {
                const res = await chai.request(app).get('/status');
                expect(res).to.have.status(422);
                expect(res.body).to.have.property('status', 'invalid');
            });
            it('should respond with code 500 if JWT_SECRET is undefined', async () => {
                const storedSecret = process.env.JWT_SECRET;
                process.env.JWT_SECRET = '';
                const res = await chai
                    .request(app)
                    .get('/status')
                    .set('Authorization', `Bearer ${validAuthToken}`);
                expect(res).to.have.status(500);
                expect(res.body).to.have.property(
                    'message',
                    'Internal Service Error'
                );
                process.env.JWT_SECRET = storedSecret;
            });
            it('should respond with code 401 and status property of "invald" if the user signed to the JWT is not verified', async () => {
                const newUserToken = jwt.sign(
                    { userId: newUser.id },
                    JWT_SECRET
                );
                const res = await chai
                    .request(app)
                    .get('/status')
                    .set('Authorization', `Bearer ${newUserToken}`);
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('status', 'invalid');
            });
            it('should respond with code 500 if there is an error querying the db', async () => {
                findOneStub = stub.error.findOneStub();
                const res = await chai
                    .request(app)
                    .get('/status')
                    .set('Authorization', `Bearer ${validAuthToken}`);
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('status', 'error');
            });
        });

        describe('post endpoints', () => {
            describe('postLogin', () => {
                let userBeforeRegistration = generateDummyUser(true);
                let registeredUser: UserDocument;
                before(async () => {
                    const hashedPass = await bcrypt.hash(
                        userBeforeRegistration.password,
                        12
                    );
                    registeredUser = await User.create({
                        displayUsername: userBeforeRegistration.username,
                        email: userBeforeRegistration.email,
                        firstName: userBeforeRegistration.firstName,
                        hashedPass,
                        lastInit: userBeforeRegistration.lastInit,
                        verificationToken:
                            userBeforeRegistration.verificationToken
                    });
                    await User.updateStatus(registeredUser._id, 'verified');
                });
                it('should respond with status code 422 and error message if inputs missing from request', async () => {
                    const resWithoutEmail = await chaiPostReq('/login', {
                        password: userBeforeRegistration.password
                    });
                    const resWithoutPass = await chaiPostReq('/login', {
                        email: userBeforeRegistration.email
                    });
                    expect(resWithoutEmail).to.have.status(422);
                    expect(resWithoutEmail.body).to.have.property(
                        'message',
                        'Validation Error'
                    );
                    expect(resWithoutEmail.body).to.have.property(
                        'error',
                        '"email" is required'
                    );
                    expect(resWithoutPass).to.have.status(422);
                    expect(resWithoutPass.body).to.have.property(
                        'message',
                        'Validation Error'
                    );
                    expect(resWithoutPass.body).to.have.property(
                        'error',
                        '"password" is required'
                    );
                });
                it('should respond with status code 200 and users info if credentials are valid', async () => {
                    const { email, firstName, lastInit, _id, displayUsername } =
                        registeredUser;
                    const res = await chaiPostReq('/login', {
                        email: userBeforeRegistration.email,
                        password: userBeforeRegistration.password
                    });
                    expect(res).to.have.status(200);
                    expect(res.body.user).to.have.property(
                        '_id',
                        _id.toHexString()
                    );
                    expect(res.body.user).to.have.property(
                        'username',
                        displayUsername
                    );
                    expect(res.body.user).to.have.property('email', email);
                    expect(res.body.user).to.have.property(
                        'firstName',
                        firstName
                    );
                    expect(res.body.user).to.have.property(
                        'lastInit',
                        lastInit
                    );
                    expect(res.body.user).to.have.property(
                        'status',
                        'verified'
                    );
                    expect(res.body.user.lastActivity).to.be.a('string');
                    expect(res.body.token).to.be.a('string');
                });
                it('should respond with status code 401 if user email does not exist', async () => {
                    const { email, firstName, lastInit, _id, displayUsername } =
                        registeredUser;
                    const res = await chaiPostReq('/login', {
                        email: 'someFakeEmail@email.com',
                        password: userBeforeRegistration.password
                    });
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property(
                        'message',
                        'Incorrect Email or Password'
                    );
                });
                it('should respond with status code 401 if password incorrect', async () => {
                    const { email, firstName, lastInit, _id, displayUsername } =
                        registeredUser;
                    const res = await chaiPostReq('/login', {
                        email: userBeforeRegistration.email,
                        password: 'badPass'
                    });
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property(
                        'message',
                        'Incorrect Email or Password'
                    );
                });
            });
            describe('postRegister', () => {
                const dummyUser = generateDummyUser(false);
                const firstUser = generateDummyUser(false);
                it('should respond with status code 201 with a status of "pending" when using valid credentials', async () => {
                    const res = await chaiPostReq('/register', {
                        email: firstUser.email,
                        username: firstUser.username,
                        firstName: firstUser.firstName,
                        lastInit: firstUser.lastInit,
                        password: firstUser.password
                    });
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('status', 'pending');
                });

                it('should respond with status code 201 with a status of "pending" when using the same email "pending" user', async () => {
                    const { username, email, password, firstName, lastInit } =
                        generateDummyUser(false);
                    const res = await chaiPostReq('/register', {
                        email: firstUser.email,
                        username: username,
                        firstName: firstName,
                        password: password,
                        lastInit: lastInit
                    });
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('status', 'pending');
                });
                it('should respond with status code 201 with a status of "pending" when using the same username "pending" user', async () => {
                    const { username, email, password, firstName, lastInit } =
                        generateDummyUser(false);
                    const res = await chaiPostReq('/register', {
                        email: email,
                        username: firstUser.username,
                        firstName: firstName,
                        password: password,
                        lastInit: lastInit
                    });
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('status', 'pending');
                });
                it('should respond with status code of 422 if any fields are missing', async () => {
                    const res = await chaiPostReq('/register', {
                        email: dummyUser.email,
                        firstName: dummyUser.firstName,
                        password: dummyUser.password,
                        lastInit: dummyUser.lastInit
                    });
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.property(
                        'message',
                        'Validation Error'
                    );
                    expect(res.body).to.have.property(
                        'error',
                        '"username" is required'
                    );
                });
                it('should respond with status code of 422 if profanity is contained in request', async () => {
                    const res = await chaiPostReq('/register', {
                        email: dummyUser.email,
                        firstName: 'ass',
                        username: dummyUser.username,
                        password: dummyUser.password,
                        lastInit: dummyUser.lastInit
                    });

                    expect(res).to.have.status(422);
                    expect(res.body).to.have.property(
                        'message',
                        'Validation Error'
                    );
                    expect(res.body).to.have.property(
                        'error',
                        'Use of foul language is prohibited'
                    );
                });
                it('should respond with status code of 400 is username is already in use', async () => {
                    const res = await chaiPostReq('/register', {
                        email: dummyUser.email,
                        firstName: dummyUser.firstName,
                        username: 'ahu22',
                        password: dummyUser.password,
                        lastInit: dummyUser.lastInit
                    });

                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property(
                        'message',
                        'Username or Email already in use.'
                    );
                });
                it('should respond with status code of 400 is email is already in use', async () => {
                    const res = await chaiPostReq('/register', {
                        email: 'test@email.com',
                        firstName: dummyUser.firstName,
                        username: dummyUser.username,
                        password: dummyUser.password,
                        lastInit: dummyUser.lastInit
                    });

                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', 'error');
                    expect(res.body).to.have.property(
                        'message',
                        'Username or Email already in use.'
                    );
                });
            });
        });
    });
});
