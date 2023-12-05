import MongoDb, { Collection, Db, ObjectId, InsertOneResult } from 'mongodb';
import { getCollection } from '../db/connection';
import { GroupCreateInput, GroupDocument } from '../types/groupTypes';

import { injectDb } from './helpers/injectDb';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import Question from './Question';
import { sanitizeId } from './helpers/utility';
import User from './User';
import { UserDocument } from '../types';

export let groupCollection: Collection<Partial<GroupDocument>>;
export const assignGroupCollection = async () => {
    if (!groupCollection && process.env.NODE_ENV !== 'test') {
        groupCollection = await getCollection<Partial<GroupDocument>>('groups');
    }
};

class Group {
    private groupInfo: GroupDocument | null;
    private adminIdStrings: string[];
    private memberIdStrings: string[];

    constructor() {
        this.groupInfo = null;
        this.adminIdStrings = [];
        this.memberIdStrings = [];
    }

    static injectDb(db: Db) {
        if (process.env.NODE_ENV === 'test') {
            groupCollection = injectDb(db, 'groups');
        }
    }

    // Run isAdmin before executing anything that will update the GroupDocument in the db
    isAdmin(adminId: ObjectId | string): ObjectId {
        if (!adminId) {
            const error = createExtendedError({
                message: 'adminId required to update group',
                statusCode: 422
            });
            throw error;
        }

        adminId = sanitizeId(adminId);
        if (!this.adminIdStrings.includes(adminId.toHexString())) {
            {
                const error = createExtendedError({
                    message: 'Unauthorized',
                    statusCode: 401
                });
                throw error;
            }
        }
        return adminId;
    }

    async updateName(userId: ObjectId | string) {
        try {
            userId = sanitizeId(userId);
            this.isAdmin(userId);
        } catch (error) {}
    }

    async create({
        name,
        adminId,
        open,
        passCode
    }: GroupCreateInput): Promise<GroupDocument> {
        adminId = sanitizeId(adminId);
        let insertResult: InsertOneResult;
        try {
            insertResult = await groupCollection.insertOne({
                name: name.toLowerCase(),
                displayName: name,
                admins: [adminId],
                members: [adminId],
                featuredQuestion: undefined,
                passCode,
                open
            });
        } catch (error: any) {
            if (error.code === 11000) {
                const extendedError = createExtendedError({
                    message: 'Group name already in use',
                    statusCode: 409,
                    stack: error.stack
                });
                throw extendedError;
            }
            throw new Error(
                `There was an error creating the group: ${error.message}`
            );
        }

        let result: GroupDocument | null;
        try {
            result = await groupCollection.findOne<GroupDocument>({
                _id: insertResult.insertedId
            });
        } catch (error: any) {
            throw new Error(
                `There was an error creating the group: ${error.message}`
            );
        }

        if (!result) {
            throw new Error('There was an error creating the group');
        }

        await User.addAdmin({ adminId, groupId: result._id });
        await User.addGroup({ userId: adminId, groupId: result._id });
        this.adminIdStrings = result.admins.map((adminId) =>
            adminId.toHexString()
        );
        this.memberIdStrings = result.members.map((memberId) =>
            memberId.toHexString()
        );
        this.groupInfo = result;

        return result;
    }

    async setGroup({
        key,
        value
    }: {
        key: '_id' | 'name';
        value: string | ObjectId;
    }): Promise<GroupDocument> {
        let result: GroupDocument | null = null;
        try {
            if (key === '_id') {
                value = sanitizeId(value);
                result = await groupCollection.findOne<GroupDocument>({
                    [key]: value
                });
            } else if (key === 'name' && typeof value === 'string') {
                result = await groupCollection.findOne<GroupDocument>({
                    [key]: value.toLowerCase()
                });
            }

            if (!result) {
                throw new Error('Could not find group');
            }

            this.adminIdStrings = result.admins.map((adminId) =>
                adminId.toHexString()
            );
            this.memberIdStrings = result.members.map((memberId) =>
                memberId.toHexString()
            );
            this.groupInfo = result;

            return result;
        } catch (error) {
            throw error;
        }
    }

    getGroup(): GroupDocument {
        if (!this.groupInfo) {
            if (document === null) {
                const extendedError = new ExtendedError(
                    'Could not find requested group'
                );
                extendedError.statusCode = 404;
                throw extendedError;
            }
        }
        return this.groupInfo as GroupDocument;
    }

    getAdminsAsStrings(): string[] {
        if (!this.groupInfo) {
            if (document === null) {
                const extendedError = new ExtendedError(
                    'Could not find requested group'
                );
                extendedError.statusCode = 404;
                throw extendedError;
            }
        }
        return this.adminIdStrings as string[];
    }

    getMembersStrings(): string[] {
        return this.memberIdStrings;
    }

    async addMember(
        userId: string | ObjectId,
        passCode?: string
    ): Promise<GroupDocument> {
        if (this.memberIdStrings.includes(userId.toString())) {
            return this.groupInfo as GroupDocument;
        }

        userId = sanitizeId(userId);
        if (!this.groupInfo) {
            throw new Error('Group has not been assigned');
        }
        if (this.groupInfo.passCode) {
            if (this.groupInfo.passCode !== passCode) {
                const error = createExtendedError({
                    message: 'Incorrect passcode',
                    statusCode: 401
                });
                throw error;
            }
        }
        const documentId = sanitizeId(this.groupInfo._id);
        const result = await groupCollection.findOneAndUpdate(
            { _id: documentId },
            { $push: { members: userId as any } },
            { returnDocument: 'after' }
        );
        if (!result) {
            const error = createExtendedError({
                message: 'Group not found',
                statusCode: 404
            });
            throw error;
        }
        await User.addGroup({ userId, groupId: this.groupInfo._id });
        this.groupInfo = result as GroupDocument;
        this.memberIdStrings = result.members!.map((memberId) =>
            memberId.toHexString()
        );
        return result as GroupDocument;
    }

    async addAdmin({
        adminId,
        userId
    }: {
        adminId: string | ObjectId;
        userId: string | ObjectId;
    }) {
        adminId = this.isAdmin(adminId);
        userId = sanitizeId(userId);

        if (this.adminIdStrings.includes(userId.toHexString())) {
            throw createExtendedError({
                message: 'User is already an admin',
                statusCode: 409
            });
        }
        // add the user to the admins list

        let updatedGroupDoc: GroupDocument;
        try {
            updatedGroupDoc = (await groupCollection.findOneAndUpdate(
                { _id: this.groupInfo?._id },
                { $push: { admins: userId as any } },
                { returnDocument: 'after' }
            )) as GroupDocument;
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error updating the group admins: ${error.message}`,
                statusCode: 500
            });
        }

        this.groupInfo = updatedGroupDoc;

        if (!updatedGroupDoc) {
            throw createExtendedError({
                message: 'There was an error adding the user as a group admin',
                statusCode: 500
            });
        }

        try {
            await User.addAdmin({
                adminId: userId,
                groupId: this.groupInfo._id
            });
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error updating the group admins: ${error.message}`,
                statusCode: 500
            });
        }
        return true;
    }

    static async findGroup({
        key,
        value
    }: {
        key: '_id' | 'name';
        value: string | ObjectId;
    }): Promise<GroupDocument | null> {
        try {
            if (key === '_id' && typeof value === 'string') {
                value = new ObjectId(value);
            }
        } catch (error) {
            throw error;
        }
        let result: GroupDocument | null;
        try {
            result = await groupCollection.findOne<GroupDocument>({
                [key]: value
            });
        } catch (error) {
            throw new Error('There was an error getting the document');
        }

        if (!result) {
            const extendedError = new ExtendedError('Could not locate group');
            extendedError.statusCode = 404;
            throw extendedError;
        }

        return result;
    }

    async updateFeaturedQuestion({
        adminId,
        questNum
    }: {
        adminId: string | ObjectId;
        questNum: number;
    }) {
        adminId = this.isAdmin(adminId);

        // This will throw an error if no question info for this questNum exist
        const questionInfo = await Question.getQuestionInfo(questNum);

        const updatedGroupDoc = (await groupCollection.findOneAndUpdate(
            {
                _id: this.groupInfo?._id
            },
            { $set: { featuredQuestion: questNum } },
            { returnDocument: 'after' }
        )) as GroupDocument;

        if (!updatedGroupDoc) {
            throw createExtendedError({
                message:
                    "There was an error updating the group's featuredQuestion",
                statusCode: 500
            });
        }

        this.groupInfo = updatedGroupDoc;
        return questionInfo;
    }

    async getMembersInfo(userId: string | ObjectId) {
        console.log(userId);
        console.log(this.groupInfo);
        userId = sanitizeId(userId);

        if (
            !this.memberIdStrings.includes(userId.toHexString()) ||
            !this.adminIdStrings.includes(userId.toHexString())
        ) {
            console.log('broken');
            throw createExtendedError({
                message: 'Unauthorized',
                statusCode: 401
            });
        }

        const userIds = this.memberIdStrings.map((id) => new ObjectId(id));

        let result: UserDocument[];

        try {
            result = await User.getUsers(userIds);
        } catch (error) {
            throw error;
        }

        const sanitizedUserObjects = result.map((userDoc) => ({
            _id: userDoc._id,
            firstName: userDoc.firstName,
            lastInit: userDoc.lastInit,
            username: userDoc.displayUsername,
            lastActivity: userDoc.lastActivity
        }));
        return sanitizedUserObjects;
    }

    static async findGroups(): Promise<GroupDocument[]> {
        const result = await groupCollection
            .find<GroupDocument>({}, { projection: { passCode: 0 } })
            .toArray();

        return result;
    }

    static async findGroupById(
        _id: string | ObjectId
    ): Promise<GroupDocument | null> {
        return await Group.findGroup({ key: '_id', value: _id });
    }

    static async findGroupByName(name: string) {
        return await Group.findGroup({
            key: 'name',
            value: name.toLowerCase()
        });
    }

    static async findGroupGeneralLeaderboard(
        userId: string | ObjectId,
        groupId: string | ObjectId
    ) {
        try {
            const result = await Question.getGeneralLeaderboard(
                userId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }
}

export default Group;
