import { Collection, Db, MongoClient, ObjectId, FindCursor } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import chaiHttp from 'chai-http';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { Server } from 'http';
// @ts-ignore
import log from 'why-is-node-running';

import { closeDb } from '../../../db/connection';
import { app, startServer } from '../../../app';
import User from '../../../models/User';
import { createMockDb } from '../../helpers';
import { UserDocument } from '../../../types';
import { ExtendedError } from '../../../errors/helpers';

const { expect } = chai;
chai.use(chaiHttp);

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
        return sinon.stub(Collection.prototype, 'findOne').throws(error);
      },
    },
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
        toArray: () => Promise.resolve([]),
      } as unknown as FindCursor<Document>),
  },
  undefined: {
    aggregateStub: (): SinonStub =>
      sinon.stub(Collection.prototype, 'aggregate').resolves(undefined),
  },
};
// const generateDummyUser = (verifiedStatus: boolean) => ({
//   username: faker.internet.userName(),
//   email: faker.internet.email(),
//   password: faker.internet.password(),
//   firstName: faker.person.firstName(),
//   lastInit: faker.string.alpha(1),
//   verfied: verifiedStatus ? 'verfied' : 'pending',
//   verificationToken: 'someToken',
//   passwordToken: 'paswordToken',
//   lastActivity: new Date(),
// });

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
      verificationToken: 'someToken',
    });

    validAuthToken = jwt.sign(
      {
        userId: '65532e27b3bfb5f3c36265b1',
        email: 'lily@email.com',
        username: 'puppygirl',
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

  after((done) => {
    if (testServer) {
      testServer.close();
    }
    setTimeout(function () {
      log(); // logs out active handles that are keeping node running
      done();
    }, 100);
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
        expect(res.body).to.have.property('message', 'Internal Service Error');
        process.env.JWT_SECRET = storedSecret;
      });
      it('should respond with code 401 and status property of "invald" if the user signed to the JWT is not verified', async () => {
        const newUserToken = jwt.sign({ userId: newUser.id }, JWT_SECRET);
        const res = await chai
          .request(app)
          .get('/status')
          .set('Authorization', `Bearer ${newUserToken}`);
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('status', 'invalid');
      });
      it('should respond with code 401 and status property of "invald" if the user signed to the JWT does not exist', async () => {
        findOneStub = stub.null.findOneStub();
        const newUserToken = jwt.sign({ userId: newUser.id }, JWT_SECRET);
        const res = await chai
          .request(app)
          .get('/status')
          .set('Authorization', `Bearer ${newUserToken}`);
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('status', 'invalid');
      });
    });
  });
});
