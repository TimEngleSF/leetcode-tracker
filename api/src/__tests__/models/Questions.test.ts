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
  GeneralLeaderboardEntry,
  GetGeneralLeaderboardQuery,
  GetQuestionLeaderboardQueryResult,
  QuestionDocument,
  QuestionInfoDocument,
  QuestionLeaderboardEntry,
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
  let aggregateStub: SinonStub;

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
    if (aggregateStub) {
      aggregateStub.restore();
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
        userId: newUser._id.toHexString(),
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
        result = await Question.getReviewQuestions(
          newUser._id.toHexString(),
          0,
          10
        );
      });
      it('should return an array', async () => {
        expect(result).to.be.an('array');
      });
      it('should contain QuestionInfoDocuments', async () => {
        expect(result[0]._id).to.be.an.instanceOf(ObjectId);
        expect(result[0].title).to.be.a('string');
        expect(result[0].questId).to.be.a('number');
        expect(result[0].diff).to.be.a('string');
        expect(result[0].url).to.match(urlRegex);
      });
      it('should throw a transformed error if an error is encountered while querying db', async () => {
        aggregateStub = stub.error.aggregateStub();
        await testErrorTransformation(
          () => Question.getReviewQuestions(newUser._id.toHexString(), 0, 10),
          500
        );
      });
    });
    describe('getGeneralLeaderboard', () => {
      let result: GetGeneralLeaderboardQuery;
      before(async () => {
        result = await Question.getGeneralLeaderboard(
          '65532e27b3bfb5f3c36265b1'
        );
      });
      it('should return a UserData object', async () => {
        expect(result.userResult).to.be.an('object');
        expect(result.userResult.name).to.equal('Lily E.');
        expect(result.userResult.passedCount).to.equal(106);
        expect(result.userResult.rank).to.equal(1);
        expect(result.userResult.userId).to.be.an.instanceOf(ObjectId);
      });
      it('should return a leaderboardResult array of objects with the correct properties', () => {
        result.leaderboardResult.forEach(
          (document: GeneralLeaderboardEntry) => {
            expect(document.name).to.be.a('string');
            expect(document.passedCount).to.be.greaterThan(0);
            expect(document.rank).to.be.greaterThan(0);
            expect(document.userId).to.be.an.instanceOf(ObjectId);
            expect(document.lastActivity).to.be.an.instanceOf(Date);
          }
        );
      });
      it('should return a userResult with rank property set to null if user has not submitted any question data', async () => {
        const result = await Question.getGeneralLeaderboard(
          '65582bcf802c62a3b071fde9'
        );
        expect(result.userResult.rank).to.be.null;
        expect(result.userResult.passedCount).to.equal(0);
        expect(result.userResult.rank).to.be.null;
      });

      it('should throw a transformed error if an error is encountered while querying db', async () => {
        aggregateStub = stub.error.aggregateStub();
        await testErrorTransformation(
          () => Question.getGeneralLeaderboard(newUser._id),
          500
        );
      });
    });
    describe('getQuestionLeaderboard', () => {
      let sortBySpeedResult: GetQuestionLeaderboardQueryResult;
      let sortByPassedResult: GetQuestionLeaderboardQueryResult;
      let sortBySpeedNoUserQuestions: GetQuestionLeaderboardQueryResult;
      before(async () => {
        sortBySpeedResult = await Question.getQuestionLeaderboard(
          newUser._id,
          22,
          true
        );
        sortByPassedResult = await Question.getQuestionLeaderboard(
          newUser._id,
          22,
          false
        );
        sortBySpeedNoUserQuestions = await Question.getQuestionLeaderboard(
          '65582bcf802c62a3b071fde9',
          22,
          true
        );
      });
      it('should throw a transformed error with statusCode 500 if an error is encountered while querying db', async () => {
        aggregateStub = stub.error.aggregateStub();
        await testErrorTransformation(
          () => Question.getQuestionLeaderboard(newUser._id, 22, true),
          500
        );
      });
      it('should throw a transformed error with statusCode 404 if the question being queried for the leaderboard does not have a corresponding questionInfo document', async () => {
        // findOneStub = stub.null.findOneStub();
        await testErrorTransformation(
          () => Question.getQuestionLeaderboard(newUser._id, 8000, true),
          404
        );
      });
      describe('sort by speed', () => {
        it('should return a UserData object for the correct user', () => {
          const result = sortBySpeedResult.userResult;
          expect(result.userId.toHexString()).to.equal(
            newUser._id.toHexString()
          );
          expect(result.minSpeed).to.be.a('number');
          expect(result.name).to.be.a('string');
          expect(result.lastActivity).to.be.an.instanceOf(Date);
          expect(result.passedCount).to.be.a('number');
          expect(result.rank).to.be.a('number');
        });
        it('should return a leaderboardResult array of objects with the correct properties', () => {
          const { leaderboardResult } = sortBySpeedResult;
          leaderboardResult.forEach((document: QuestionLeaderboardEntry) => {
            expect(document.name).to.be.a('string');
            expect(document.minSpeed).to.be.greaterThan(0);
            expect(document.passedCount).to.be.greaterThan(0);
            expect(document.rank).to.be.greaterThan(0);
            expect(document.userId).to.be.an.instanceOf(ObjectId);
            expect(document.lastActivity).to.be.an.instanceOf(Date);
          });
        });
        it('should return a leaderboardResult array where minSpeed is sorted in ascending order', () => {
          const { leaderboardResult } = sortBySpeedResult;
          const expectedSortedResult = [...leaderboardResult].sort(
            (a, b) => a.minSpeed - b.minSpeed
          );
          expect(leaderboardResult).to.deep.equal(expectedSortedResult);
        });
        it('should return a userResult object where rank and minSpeed are null and passedCount is 0 if the requesting user has not added a result for the question number being queried', () => {
          const result = sortBySpeedNoUserQuestions.userResult;
          expect(result.name).to.be.a('string');
          expect(result.minSpeed).to.be.null;
          expect(result.passedCount).to.equal(0);
          expect(result.rank).to.be.null;
          expect(result.userId).to.be.an.instanceOf(ObjectId);
          expect(result.lastActivity).to.be.an.instanceOf(Date);
        });
      });
      describe('sort by passedCount', () => {
        it('should return a UserData object for the correct user', () => {
          const { userResult } = sortByPassedResult;
          expect(userResult.userId.toHexString()).to.equal(
            newUser._id.toHexString()
          );
          expect(userResult.minSpeed).to.be.a('number');
          expect(userResult.name).to.be.a('string');
          expect(userResult.lastActivity).to.be.an.instanceOf(Date);
          expect(userResult.passedCount).to.be.a('number');
          expect(userResult.rank).to.be.a('number');
        });
        it('should return a leaderboardResult array of objects with the correct properties', () => {
          const { leaderboardResult } = sortByPassedResult;
          leaderboardResult.forEach((document: QuestionLeaderboardEntry) => {
            expect(document.name).to.be.a('string');
            expect(document.minSpeed).to.be.greaterThan(0);
            expect(document.passedCount).to.be.greaterThan(0);
            expect(document.rank).to.be.greaterThan(0);
            expect(document.userId).to.be.an.instanceOf(ObjectId);
            expect(document.lastActivity).to.be.an.instanceOf(Date);
          });
        });
        it('should return a leaderboardResult array where minSpeed is sorted in ascending order', () => {
          const { leaderboardResult } = sortByPassedResult;
          const expectedSortedResult = [...leaderboardResult].sort(
            (a, b) => b.passedCount - a.passedCount
          );
          expect(leaderboardResult).to.deep.equal(expectedSortedResult);
        });
        it('should return a userResult object where rank and minSpeed are null and passedCount is 0 if the requesting user has not added a result for the question number being queried', () => {
          const result = sortBySpeedNoUserQuestions.userResult;
          expect(result.name).to.be.a('string');
          expect(result.minSpeed).to.be.null;
          expect(result.passedCount).to.equal(0);
          expect(result.rank).to.be.null;
          expect(result.userId).to.be.an.instanceOf(ObjectId);
          expect(result.lastActivity).to.be.an.instanceOf(Date);
        });
      });
    });
  });
});
