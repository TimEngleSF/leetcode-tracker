import {
  Db,
  MongoClient,
  Collection,
  ObjectId,
  InsertOneResult,
} from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
// import User from '../../models/User';
import { closeDb } from '../../db/connection';
import { UserDocument } from '../../types/userTypes';
import { ExtendedError } from '../../errors/helpers';
import Question from '../../models/Question';
import { createMockDb } from '../helpers';
import User from '../../models/User';
import { QuestionDocument } from '../../types/questionTypes';
import exp from 'constants';

const { expect } = chai;

const stub = {
  error: {
    findOneStub: (): SinonStub =>
      sinon
        .stub(Collection.prototype, 'findOne')
        .throws(new Error('Simulated Error')),
    findOneAndUpdate: () =>
      sinon
        .stub(Collection.prototype, 'findOneAndUpdate')
        .throws(new Error('Simulated error')),
    insertOneStub: () =>
      sinon
        .stub(Collection.prototype, 'findOne')
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
  },
};

const testErrorTransformation = async (action: Function) => {
  try {
    await action();
    expect.fail('Expected an error but none was thrown');
  } catch (error: any) {
    expect(error).to.be.an.instanceOf(ExtendedError);
    expect(error.statusCode).to.be.equal(500);
  }
};

describe('Question model', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let uri: string;
  let findOneStub: SinonStub;
  let insertOneStub: SinonStub;

  // Insert data
  let newUser: UserDocument;
  let questNum: number;
  let speed: number | undefined;
  let randBoolean: boolean;
  let date: Date;
  let insertedResult: QuestionDocument;

  before(async () => {
    ({ mongoServer, client, db, uri } = await createMockDb());
    newUser = await User.create({
      displayUsername: faker.internet.userName(),
      email: faker.internet.email(),
      hashedPass: faker.internet.password(),
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

  afterEach(() => {
    if (findOneStub) {
      findOneStub.restore();
    }
    if (insertOneStub) {
      insertOneStub.restore();
    }
  });

  describe('add question', () => {
    beforeEach(async () => {
      if (findOneStub) {
        findOneStub.restore();
      }
      if (insertOneStub) {
        insertOneStub.restore();
      }
    });

    afterEach(() => {
      if (findOneStub) {
        findOneStub.restore();
      }
      if (insertOneStub) {
        insertOneStub.restore();
      }
    });

    it("should add a user's question data", async () => {
      questNum = faker.number.int({ min: 1, max: 2400 });
      randBoolean = faker.datatype.boolean();
      speed = randBoolean
        ? faker.number.int({ min: 50, max: 4000 })
        : undefined;
      date = faker.date.anytime();

      await Question.addQuestion({
        userId: newUser._id,
        username: newUser.username,
        questNum,
        passed: randBoolean,
        speed,
        created: date,
      });
      insertedResult = (await db
        .collection('questions')
        .findOne({ userId: newUser._id })) as any;
      expect(insertedResult._id).to.be.an.instanceOf(ObjectId);
      expect(insertedResult.userId.toHexString()).to.deep.equal(
        newUser._id.toHexString()
      );
      expect(insertedResult.username).to.equal(newUser.username);
      expect(insertedResult.questNum).to.equal(questNum);
      expect(insertedResult.passed).to.equal(randBoolean);
      expect(insertedResult.created.toString()).to.equal(date.toString());
    });

    it('should throw a transformed error if insertion is not acknowledged', async () => {
      insertOneStub = stub.null.insertOneStub();
      await testErrorTransformation(() =>
        Question.addQuestion({
          userId: newUser._id,
          username: newUser.username,
          questNum,
          passed: randBoolean,
          speed,
          created: date,
        })
      );
      insertOneStub.restore();
    });
  });

  describe('get questions methods', () => {
    describe('getQuestion', () => {
      it('should getQuestion by questId string', async () => {
        const result = await Question.getQuestion(
          insertedResult._id.toHexString()
        );
        expect(result._id.toHexString()).to.be.equal(
          insertedResult._id.toHexString()
        );
        expect(result.passed).to.equal(insertedResult.passed);
        expect(result.questNum).to.equal(insertedResult.questNum);
        expect(result.speed).to.equal(insertedResult.speed);
        expect(result.userId.toHexString()).to.equal(
          insertedResult.userId.toHexString()
        );
        expect(result.created.toString()).to.equal(date.toString());
      });
      it('should throw a transform error if there is no result by questId string', async () => {
        findOneStub = stub.null.findOneStub();
        try {
          await Question.getQuestion(insertedResult._id);
        } catch (error: any) {
          expect(error).to.be.an.instanceOf(ExtendedError);
          expect(error.statusCode).to.equal(404);
          expect(error.stack).to.not.be.null;
        }
      });
      it('should throw a transform error with stack if there is an error querying the db', async () => {
        insertOneStub = stub.error.insertOneStub();
        try {
          await Question.getQuestion(insertedResult._id);
        } catch (error: any) {
          expect(error).to.be.an.instanceOf(ExtendedError);
          expect(error.statusCode).to.equal(500);
          expect(error.stack).to.not.be.null;
        }
      });
    });
  });
});
