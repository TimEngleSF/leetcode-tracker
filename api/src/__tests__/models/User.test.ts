import { Db, MongoClient, Collection, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import User from '../../models/User.js';
import { closeDb } from '../../db/connection.js';
import { UserDocument } from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';

const { expect } = chai;

describe('User model', () => {
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
    if (findOneStub) {
      findOneStub.restore();
    }
  });

  describe('get methods', () => {
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
          expect(user).to.be.null;
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
        const user = await User.getByUsername(
          `   ${newUser.displayUsername}  `
        );
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
        const user = await User.getByEmail(
          `   ${newUser.email.toUpperCase()}  `
        );
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
        const user = await User.getByVerificationToken(
          newUser.verificationToken
        );
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

  describe('create method', () => {
    describe('create', () => {
      let createdUser: UserDocument;
      let sanatizedUser: UserDocument;
      let errorUser: UserDocument;
      let sanitizedUserPayload: any;
      let insertOneStub: SinonStub;

      const errorUserPayload = {
        displayUsername: 'Testing',
        email: 'testing@email.com',
        firstName: 'Test',
        lastInit: 'T',
        hashedPass: 'password',
        verificationToken: 'token',
      };
      before(async () => {
        let createdUserPass = await bcrypt.hash(faker.internet.password(), 12);
        createdUser = await User.create({
          displayUsername: faker.internet.userName(),
          email: faker.internet.email(),
          hashedPass: createdUserPass,
          firstName: faker.person.firstName(),
          lastInit: faker.string.alpha(1),
          verificationToken: 'someToken',
        });

        sanitizedUserPayload = {
          displayUsername: '    TeST    ',
          email: '  Test@Email.com   ',
          hashedPass: createdUserPass,
          firstName: '  first  ',
          lastInit: 'n',
          verificationToken: 'someToken',
        };
        sanatizedUser = await User.create(sanitizedUserPayload);
      });

      after(async () => {
        await User.deleteById(createdUser._id);
        await User.deleteById(sanatizedUser._id);
      });

      beforeEach(async () => {
        if (findOneStub) {
          findOneStub.restore();
        }
        if (insertOneStub) {
          insertOneStub.restore();
        }
        await db
          .collection('users')
          .deleteOne({ email: errorUserPayload.email });
      });

      it('should return a new user object with the correct properties', () => {
        expect(createdUser).to.not.be.null;
        expect(createdUser).has.property(
          '_id' &&
            'username' &&
            'displayUsername' &&
            'email' &&
            'password' &&
            'firstName' &&
            'lastInit' &&
            'validationToken' &&
            'passwordToken' &&
            'lastActivity'
        );
      });

      it('should sanitize the input data', async () => {
        expect(sanatizedUser.username).to.equal(
          sanitizedUserPayload.displayUsername.toLowerCase().trim()
        );
        expect(sanatizedUser.displayUsername).to.equal(
          sanitizedUserPayload.displayUsername.trim()
        );
        expect(sanatizedUser.email).to.equal(
          sanitizedUserPayload.email.toLowerCase().trim()
        );
        const trimmedFirstName = sanitizedUserPayload.firstName.trim();
        expect(sanatizedUser.firstName).to.equal(
          `${trimmedFirstName[0].toUpperCase()}${trimmedFirstName.substring(1)}`
        );
        expect(sanatizedUser.lastInit).to.equal(
          sanitizedUserPayload.lastInit.toUpperCase()
        );
      });

      it('should throw an error if the created user was not inserted into the database', async () => {
        insertOneStub = sinon
          .stub(Collection.prototype, 'findOne')
          .throws(new Error('Simulated Error'));
        try {
          errorUser = await User.create(errorUserPayload);
          expect.fail('Expected an error but none was thrown');
        } catch (error: any) {
          expect(error).to.be.an.instanceOf(ExtendedError);
          expect(error).to.have.property('statusCode', 500);
          expect(error.message).to.include('Database Error:');
        } finally {
          insertOneStub.restore();
        }
      });

      it('should throw an error if the created user was not found in the database', async () => {
        findOneStub = sinon
          .stub(Collection.prototype, 'findOne')
          .resolves(null);
        try {
          errorUser = await User.create(errorUserPayload);
          expect.fail('Expected an error but none was thrown');
        } catch (error: any) {
          expect(error).to.be.an.instanceOf(ExtendedError);
          expect(error).to.have.property('statusCode', 500);
          expect(error.message).to.include('Database Error:');
        } finally {
          findOneStub.restore();
        }
      });
    });
  });

  describe('update methods', () => {
    let updatedPassword: string;
    describe('updatePassword', () => {
      it('should a return a User Document with an updated password', async () => {
        updatedPassword = faker.internet.password();
        await User.updatePassword(newUser._id, updatedPassword);
        const result = await User.getById(newUser._id);
        expect(result?.password).to.not.equal(newUser.password);
        expect(result).to.deep.equal({ ...newUser, password: updatedPassword });
      });
    });

    describe('updateVerificationToken', () => {
      it('should return a User Document with an updated verificationToken', async () => {
        const updatedToken = faker.string.alphanumeric(32);
        const result = await User.updateVerificationToken(
          newUser._id,
          updatedToken
        );

        expect(result?.verificationToken).to.be.a.string;
        expect(result?.verificationToken).to.have.length(32);
        expect(result?.verificationToken).to.not.equal(
          newUser.verificationToken
        );
      });
    });

    describe('updatePasswordToken', () => {
      it('should return a User Document with an updated passwordToken', async () => {
        const updatedToken = faker.string.alphanumeric(32);
        const result = await User.updatePasswordToken(
          newUser._id,
          updatedToken
        );

        expect(result?.passwordToken).to.be.a.string;
        expect(result?.passwordToken).to.equal(updatedToken);
        expect(result?.passwordToken).to.have.length(32);
        expect(result?.passwordToken).to.not.equal(newUser.passwordToken);
      });
    });

    describe('updateStatus', () => {
      it('should return a User Document with an updated status', async () => {
        const updatedStatus = 'verified';
        const result = await User.updateStatus(newUser._id, updatedStatus);

        expect(newUser.status).to.equal('pending');
        expect(result?.status).to.be.a.string;
        expect(result?.status).to.equal('verified');
        expect(result?.status).to.not.equal(newUser.status);
      });
    });

    describe('updateLastActivity', () => {
      it('should return a User Document with an updated status', async () => {
        const result = await User.updateLastActivity(newUser._id);

        expect(result.lastActivity).to.be.a('date');
        expect(result.lastActivity).to.not.equal(newUser.lastActivity);
        expect(result.lastActivity).to.greaterThan(newUser.lastActivity);
      });
    });
  });
});
