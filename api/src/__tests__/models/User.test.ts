import { Db, MongoClient, Collection, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import User from '../../models/User.js';
import { closeDb } from '../../db/connection.js';
import { UserDocument } from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';

const { expect } = chai;

const userDocumentProperties = (user: UserDocument) => {
  '_id' &&
    'username' &&
    'displayUsername' &&
    'password' &&
    'firstname' &&
    'lastInit' &&
    'status' &&
    'verificationToken' &&
    'passwordToken' &&
    'questions' &&
    'lastActivity';
};

describe('User moded', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let newUser: UserDocument;
  let findOneStub: SinonStub;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('lc-test-db');

    User.injectDb(db);

    const newUserPass = await bcrypt.hash(faker.internet.password(), 12);
    newUser = await User.create({
      displayUsername: faker.internet.userName(),
      email: faker.internet.email(),
      hashedPass: newUserPass,
      firstName: faker.person.firstName(),
      lastInit: faker.string.alpha(1),
      verificationToken: 'someToken',
    });
  });

  after(async () => {
    User.deleteById(newUser._id);
    await closeDb();
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    // Reset stubs before each test
    if (findOneStub) {
      findOneStub.restore();
    }
  });

  describe('getById', () => {
    it('should return an object with correct properties and values', async () => {
      const user = await User.getById(newUser._id);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should return null for a non-existent ID', async () => {
      const nonExistentId = new ObjectId();
      const user = await User.getById(nonExistentId);
      expect(user).to.be.null;
    });

    it('should handle invalid ID format gracefully', async () => {
      const invalidId = '123';
      try {
        const user = await User.getById(invalidId);
        expect(user).to.be.null; // or whatever behavior is expected
      } catch (error: any) {
        expect(error.message).to.include('input must be a 24');
      }
    });

    it('should transform errors and include a statusCode with them', async () => {
      findOneStub = sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated error'));

      try {
        await User.getById(newUser._id);
        throw new Error('Expected error was not thrown');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ExtendedError);
        expect(error).to.have.property('statusCode', 500);
        expect(error.message).to.include('Database Error:');
      } finally {
        findOneStub.restore();
      }
    });
  });

  describe('getByUsername', () => {
    it('should return an object with correct properties and values', async () => {
      const user = await User.getByUsername(newUser.username);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should not be dependent on casing and whitespace', async () => {
      const user = await User.getByUsername(`   ${newUser.displayUsername}  `);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should return null for a non-existent username', async () => {
      const user = await User.getByUsername('randomUser');
      expect(user).to.be.null;
    });

    it('should transform errors and include a statusCode with them', async () => {
      findOneStub = sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated error'));

      try {
        await User.getByUsername(newUser.username);
        throw new Error('Expected error was not thrown');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ExtendedError);
        expect(error).to.have.property('statusCode', 500);
        expect(error.message).to.include('Database Error:');
      } finally {
        findOneStub.restore();
      }
    });
  });

  describe('getByEmail', () => {
    it('should return an object with correct properties and values', async () => {
      const user = await User.getByEmail(newUser.email);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should not be dependent on casing and whitespace', async () => {
      const user = await User.getByEmail(`   ${newUser.email.toUpperCase()}  `);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should return null for a non-existent email', async () => {
      const user = await User.getByEmail('randomUser@email.com');
      expect(user).to.be.null;
    });

    it('should transform errors and include a statusCode with them', async () => {
      findOneStub = sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated error'));

      try {
        await User.getByEmail(newUser.email);
        throw new Error('Expected error was not thrown');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ExtendedError);
        expect(error).to.have.property('statusCode', 500);
        expect(error.message).to.include('Database Error:');
      } finally {
        findOneStub.restore();
      }
    });
  });

  describe('getByVerificationToken', () => {
    it('should return an object with correct properties and values', async () => {
      const user = await User.getByVerificationToken(newUser.verificationToken);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should return null for a non-existent verificationToken', async () => {
      const user = await User.getByVerificationToken(
        'someTokenThatDoesNotExist'
      );
      expect(user).to.be.null;
    });

    it('should transform errors and include a statusCode with them', async () => {
      findOneStub = sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated error'));

      try {
        await User.getByVerificationToken(newUser.verificationToken);
        throw new Error('Expected error was not thrown');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ExtendedError);
        expect(error).to.have.property('statusCode', 500);
        expect(error.message).to.include('Database Error:');
      } finally {
        findOneStub.restore();
      }
    });
  });

  describe('getByPasswordToken', () => {
    const passwordToken = 'somePasswordToken';
    before(async () => {
      newUser = { ...newUser, passwordToken };
      await User.updatePasswordToken(newUser._id, passwordToken);
    });

    it('should return an object with correct properties and values', async () => {
      const user = await User.getByPasswordToken(passwordToken);
      expect(user).not.to.be.null;
      expect(user).to.deep.equal(newUser);
    });

    it('should return null for a non-existent passwordToken', async () => {
      const user = await User.getByPasswordToken('someTokenThatDoesNotExist');
      expect(user).to.be.null;
    });

    it('should transform errors and include a statusCode with them', async () => {
      findOneStub = sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated error'));

      try {
        await User.getByPasswordToken(passwordToken);
        throw new Error('Expected error was not thrown');
      } catch (error: any) {
        expect(error).to.be.instanceOf(ExtendedError);
        expect(error).to.have.property('statusCode', 500);
        expect(error.message).to.include('Database Error:');
      } finally {
        findOneStub.restore();
      }
    });
  });
});
