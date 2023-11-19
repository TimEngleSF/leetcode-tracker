import {
  Db,
  MongoClient,
  Collection,
  ObjectId,
  InsertOneResult,
  FindCursor,
} from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';

import { closeDb } from '../../db/connection';
import { UserDocument } from '../../types/userTypes';
import { ExtendedError } from '../../errors/helpers';
import Question from '../../models/Question';
import { createMockDb } from '../helpers';
import User from '../../models/User';
import {
  QuestionDocument,
  QuestionInfoDocument,
} from '../../types/questionTypes';
import { convertDaysToMillis } from '../../models/helpers/questionHelpers';

const { expect } = chai;

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
    findStub: () =>
      sinon.stub(Collection.prototype, 'find').returns({
        toArray: () => Promise.resolve([]),
      } as unknown as FindCursor<Document>),
  },
};

const testErrorTransformation = async (
  action: Function,
  statusCode: number
) => {
  try {
    await action();
    expect.fail('Expected an error but none was thrown');
  } catch (error: any) {
    expect(error).to.be.an.instanceOf(ExtendedError);
    expect(error.statusCode).to.be.equal(statusCode);
    expect(error.statck).to.not.be.null;
  }
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

const generateNewUserQuestionPayload = (
  userId: ObjectId | 'string',
  username: string,
  questNum: number,
  date: { fromDaysAgo: number; toDaysAgo: number }
) => {
  if (date.fromDaysAgo < date.toDaysAgo) {
    throw new Error('date.fromDays ago must be greater than date.toDaysAgo');
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
    speed: payloadPassed ? faker.number.int({ min: 50, max: 4000 }) : undefined,
    created: faker.date.between({
      from: generateDate(date.fromDaysAgo),
      to: generateDate(date.toDaysAgo),
    }),
  };
};

describe('Question model', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let uri: string;
  let findOneStub: SinonStub;
  let insertOneStub: SinonStub;
  let findStub: SinonStub;

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
    if (findStub) {
      findStub.restore();
    }
  });

  describe('add question', () => {
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
      await testErrorTransformation(
        () =>
          Question.addQuestion({
            userId: newUser._id,
            username: newUser.username,
            questNum,
            passed: randBoolean,
            speed,
            created: date,
          }),
        500
      );
      insertOneStub.restore();
    });
  });

  describe('get questions methods', () => {
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

    describe('getQuestion', () => {
      it('should getQuestion by questId string and return the correct data', async () => {
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
    describe('getQuestionInfo', () => {
      it('should get question info by a number and return the correct data', async () => {
        const randNum = faker.number.int({ min: 1, max: 2000 });
        const result = await Question.getQuestionInfo(randNum);
        expect(result._id).to.be.an.instanceOf(ObjectId);
        expect(['Easy', 'Medium', 'Hard']).to.include(result.diff);
        expect(result.title).to.be.a('string');
        expect(result.url).to.match(urlRegex);
      });
      it('should throw a transformed error with statusCode 404 if query returns null', async () => {
        findOneStub = stub.null.findOneStub();
        await testErrorTransformation(
          () => Question.getQuestionInfo(5000),
          404
        );
        findOneStub.restore();
      });
      it('should throw a transformed error with statusCode 500 if query method encounters an error', async () => {
        const randNum = faker.number.int({ min: 1, max: 2000 });
        findOneStub = stub.error.findOneStub();
        await testErrorTransformation(
          () => Question.getQuestionInfo(randNum),
          500
        );
      });
    });
    describe('getQuestionsByUser', () => {
      before(async () => {
        let questionPayload = {};
        for (let i = 0; i < 4; i++) {
          await addQuestionToDb(
            generateNewUserQuestionPayload(newUser._id, newUser.username, 22, {
              fromDaysAgo: 10,
              toDaysAgo: 5,
            })
          );
        }
      });
      it('should get an array of questions by userId', async () => {
        const result = await Question.getQuestionsByUser(newUser._id);
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(1);
        result.forEach((document) => {
          expect(document.questNum).to.be.a('number');
          expect(document.created).to.be.a('date');
          expect(document.passed).to.be.a('boolean');
          if (document.speed !== null) {
            expect(document.speed).to.be.a('number');
          } else {
            expect(document.speed).to.be.null;
          }
        });
      });

      it('should get an array of questions by userId and questId number', async () => {
        const result = await Question.getQuestionsByUser(newUser._id, 22);
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(1);
        result.forEach((document) => {
          expect(document.created).to.be.a('date');
          expect(document.passed).to.be.a('boolean');
          if (document.speed !== null) {
            expect(document.speed).to.be.a('number');
          } else {
            expect(document.speed).to.be.null;
          }
        });
      });

      it('should return an empty array if there are no results', async () => {
        findStub = stub.null.findStub();
        const result = await Question.getQuestionsByUser(newUser._id, 22);
        expect(result).to.be.an('array');
        expect(result).to.have.length(0);
      });

      it('should throw a transformed error if an error is encountered while querying db', async () => {
        findStub = stub.error.findStub();
        await testErrorTransformation(
          () => Question.getQuestionsByUser(newUser._id),
          500
        );
      });
    });

    describe('getReviewQuestions', () => {
      let result: QuestionInfoDocument[];
      before(async () => {
        result = await Question.getReviewQuestions(newUser._id, 0, 10);
      });
      it('should return an array', async () => {
        expect(result).to.be.an('array');
      });
      it('should contain QuestionInfoDocuments', () => {
        expect(result[0]._id).to.be.an.instanceOf(ObjectId);
        expect(result[0].title).to.be.a('string');
        expect(result[0].questId).to.be.a('number');
        expect(result[0].diff).to.be.a('string');
        expect(result[0].url).to.match(urlRegex);
      });
    });
  });
});
