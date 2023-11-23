import { Db, MongoClient, Collection, ObjectId, FindCursor } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import bcrypt from 'bcrypt';

import { closeDb } from '../../../db/connection';
import { UserDocument } from '../../../types/userTypes';
import { ExtendedError } from '../../../errors/helpers';
import Question from '../../../models/Question';
import { createMockDb } from '../../helpers';
import User from '../../../models/User';
import Group, { groupCollection } from '../../../models/Group';
import { GroupDocument } from '../../../types/groupTypes';

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

const restoreStub = (stub: SinonStub) => {
    if (stub) {
        stub.restore();
    }
};

// const createGroup = async (
//     name: string,
//     userId: ObjectId | string,
//     passCode: string
// ) => {
//     return await Group.create({
//         name,
//         adminId: typeof userId === 'string' ? new ObjectId(userId) : userId,
//         passCode
//     });
// };

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

describe('Group Model', () => {
    let mongoServer: MongoMemoryServer;
    let client: MongoClient;
    let db: Db;
    let uri: string;

    const passCode = faker.string.alpha(4).toLowerCase();
    let newUser: UserDocument;
    let group;
    let newGroup: GroupDocument;

    let findOneStub: SinonStub;
    let insertOneStub: SinonStub;
    before(async () => {
        ({ mongoServer, client, db, uri } = await createMockDb());

        const newUserPass = await bcrypt.hash(faker.internet.password(), 12);
        newUser = await User.create({
            displayUsername: faker.internet.userName(),
            email: faker.internet.email(),
            hashedPass: newUserPass,
            firstName: faker.person.firstName(),
            lastInit: faker.string.alpha(1),
            verificationToken: 'someToken'
        });
        group = new Group();
        newGroup = await group.create({
            adminId: newUser._id,
            name: 'New Group',
            open: false,
            passCode: passCode
        });
    });

    after(async () => {
        await groupCollection.drop();
        await User.deleteById(newUser._id);
        await closeDb();
        await client.close();
        await mongoServer.stop();
    });

    afterEach(async () => {
        if (findOneStub) {
            findOneStub.restore();
        }
        if (insertOneStub) {
            insertOneStub.restore();
        }
    });

    describe('create', () => {
        before(async () => {});
        it('should return a GroupDocument if a group is created successfully', async () => {
            expect(newGroup).to.be.an('object');
            expect(newGroup).to.have.property('name', 'new group'),
                expect(newGroup).to.have.property('displayName', 'New Group'),
                expect(newGroup).to.have.property('passCode', passCode);
            expect(newGroup.admins[0].toHexString()).to.include(
                newUser._id.toHexString()
            );
            expect(newGroup.admins).to.have.length(1);
            expect(newGroup.members).to.be.an('array');
            expect(newGroup.members).to.have.length(1);
            expect(newGroup.questionOfDay).to.be.null;
            expect(newGroup.questionOfWeek).to.be.null;
        });
        it('should throw an error if userId is not a valid ObjectId or ObjectId format', async () => {
            try {
                const group = new Group();
                await group.create({
                    name: 'Some Group',
                    adminId: 'afafga',
                    open: false,
                    passCode
                });
            } catch (error: any) {
                expect(error).to.not.be.null;
                expect(error.message).to.include('input must be a 24');
            }
        });
        it('should throw an error if an error is encountered while inserting new group', async () => {
            insertOneStub = stub.error.insertOneStub();
            try {
                const group = new Group();
                await group.create({
                    name: 'Error1',
                    adminId: newUser._id,
                    open: false,
                    passCode
                });
            } catch (error: any) {
                expect(error.message).to.include('There was an error');
                expect(error).to.not.be.null;
            }
        });
        it('should throw an error if the created group cannot be found by _id', async () => {
            findOneStub = stub.null.findOneStub();
            try {
                const group = new Group();
                await group.create({
                    name: 'Error2',
                    adminId: newUser._id,
                    open: false,
                    passCode
                });
            } catch (error: any) {
                expect(error.message).to.include('There was an error');
                expect(error).to.not.be.null;
            }
        });
        it('should throw an error if the created group name already exists', async () => {
            try {
                const group = new Group();
                await group.create({
                    name: 'New Group',
                    adminId: newUser._id,
                    open: false,
                    passCode
                });
            } catch (error: any) {
                expect(error.message).to.include('Group name already in use');
                expect(error).to.not.be.null;
            }
        });
    });
    describe('getGroupById', () => {
        it('should get a group by _id', async () => {
            const result = await Group.findGroupById(
                newGroup._id.toHexString()
            );
            expect(result).to.be.an('object');
            expect(newGroup).to.have.property('name', 'new group'),
                expect(newGroup).to.have.property('displayName', 'New Group'),
                expect(newGroup).to.have.property('passCode', passCode);
            expect(newGroup.admins[0].toHexString()).to.include(
                newUser._id.toHexString()
            );
            expect(newGroup.admins).to.have.length(1);
            expect(newGroup.members).to.be.an('array');
            expect(newGroup.members).to.have.length(1);
            expect(newGroup.questionOfDay).to.be.null;
            expect(newGroup.questionOfWeek).to.be.null;
        });
    });
    describe('getGroupByName', () => {
        it('should get a group by name', async () => {
            const result = await Group.findGroupByName(newGroup.displayName);
            expect(result).to.be.an('object');
            expect(newGroup).to.have.property('name', 'new group'),
                expect(newGroup).to.have.property('displayName', 'New Group'),
                expect(newGroup).to.have.property('passCode', passCode);
            expect(newGroup.admins[0].toHexString()).to.include(
                newUser._id.toHexString()
            );
            expect(newGroup.admins).to.have.length(1);
            expect(newGroup.members).to.be.an('array');
            expect(newGroup.members).to.have.length(1);
            expect(newGroup.questionOfDay).to.be.null;
            expect(newGroup.questionOfWeek).to.be.null;
        });
    });
});
