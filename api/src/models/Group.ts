import MongoDb, { Collection, Db, ObjectId, InsertOneResult } from 'mongodb';
import { getCollection } from '../db/connection';
import { GroupCreateInput, GroupDocument } from '../types/groupTypes';

import { injectDb } from './helpers/injectDb';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import Question from './Question';
import { sanitizeId } from './helpers/utility';
import User from './User';
import { UserDocument } from '../types';
import { faker } from '@faker-js/faker';

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
    private creatorIdString = '';

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
        const userDocument = await User.getById(adminId);

        if (!userDocument) {
            throw createExtendedError({
                message: 'User Document could not be found',
                statusCode: 404
            });
        }

        if (userDocument.created.length >= 3) {
            throw createExtendedError({
                message:
                    'User may not create more than three groups. Please delete a group to create another',
                statusCode: 422
            });
        }

        try {
            insertResult = await groupCollection.insertOne({
                name: name.toLowerCase(),
                displayName: name,
                admins: [adminId],
                members: [adminId],
                featuredQuestion: undefined,
                passCode,
                open,
                createdBy: adminId
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

        await User.addCreator({ adminId, groupId: result._id });

        this.creatorIdString = adminId.toHexString();
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

            this.creatorIdString = result.createdBy.toHexString();

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

    async removeMember({
        adminId,
        userId
    }: {
        adminId: ObjectId | string;
        userId: ObjectId | string;
    }) {
        try {
            adminId = this.isAdmin(adminId);
        } catch (error) {
            throw error;
        }
        userId = sanitizeId(userId);

        const groupId = this.groupInfo?._id as ObjectId;

        const userIsAMember = this.memberIdStrings.includes(
            userId.toHexString()
        );

        if (!userIsAMember) {
            throw createExtendedError({
                message: 'The user is not a member',
                statusCode: 404
            });
        }

        const userIsAnAdmin = this.adminIdStrings.includes(
            userId.toHexString()
        );

        if (userIsAnAdmin && adminId.toHexString() !== this.creatorIdString) {
            throw createExtendedError({
                message: 'Only the creator may remove admins from the group',
                statusCode: 401
            });
        }

        try {
            let updatedGroupDoc: GroupDocument;
            updatedGroupDoc = (await groupCollection.findOneAndUpdate(
                {
                    _id: this.groupInfo?._id
                },
                { $pull: { members: userId as any } },
                { returnDocument: 'after' }
            )) as GroupDocument;

            this.memberIdStrings = updatedGroupDoc.members.map((userId) =>
                userId.toHexString()
            );

            await User.removeMember({
                userId,
                groupId
            });

            if (userIsAnAdmin) {
                updatedGroupDoc = (await groupCollection.findOneAndUpdate(
                    {
                        _id: this.groupInfo?._id
                    },
                    { $pull: { admins: userId as any } },
                    { returnDocument: 'after' }
                )) as GroupDocument;

                this.adminIdStrings = updatedGroupDoc.admins.map((userId) =>
                    userId.toHexString()
                );

                await User.removeAdmin({
                    userId,
                    groupId
                });
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteGroup(adminId: string | ObjectId) {
        adminId = this.isAdmin(adminId);

        const isCreator = this.creatorIdString === adminId.toHexString();

        if (!isCreator) {
            throw createExtendedError({
                message: 'Only the creator may delete the group',
                statusCode: 401
            });
        }
        if (!this.groupInfo) {
            throw createExtendedError({
                message: 'Group object not assigned to a group',
                statusCode: 400
            });
        }
        const groupInfo = this.groupInfo as GroupDocument;
        // loop through this.groupInfo.members + this.groupInfo.admins and remove this group from those users' members and admins array

        await Promise.all(
            this.groupInfo.members.map(async (userId) => {
                await User.removeMember({ userId, groupId: groupInfo._id });
            })
        );

        await Promise.all(
            this.groupInfo.admins.map(async (userId) => {
                await User.removeAdmin({ userId, groupId: groupInfo._id });
            })
        );

        await User.removeCreated({ userId: adminId, groupId: groupInfo._id });

        try {
            await groupCollection.findOneAndDelete({ _id: groupInfo._id });
        } catch (error) {
            throw createExtendedError({
                message: 'There was an error deleting the group',
                statusCode: 500
            });
        }
    }

    async regeneratePasscode(adminId: string | ObjectId) {
        adminId = this.isAdmin(adminId);

        if (!this.groupInfo) {
            throw createExtendedError({
                message: 'Group object not assigned to a group',
                statusCode: 400
            });
        }

        const groupInfo = this.groupInfo;

        if (this.groupInfo?.open) {
            try {
                await groupCollection.findOneAndUpdate(
                    {
                        _id: groupInfo._id
                    },
                    { $set: { open: false } }
                );
            } catch (error: any) {
                throw createExtendedError({
                    message: `There was an error setting this group to private: ${error.message}`,
                    statusCode: 500
                });
            }
        }

        try {
            const newPasscode = faker.string.alphanumeric(6).toLowerCase();
            const result = await groupCollection.findOneAndUpdate(
                { _id: groupInfo._id },
                { $set: { passCode: newPasscode } },
                { returnDocument: 'after' }
            );

            if (!result) {
                throw new Error();
            }

            return result?.passCode;
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error resetting the group's passcode: ${error.message}`,
                statusCode: 500
            });
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
        userId = sanitizeId(userId);

        console.log(this.memberIdStrings, userId);

        if (!this.memberIdStrings.includes(userId.toHexString())) {
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

    async leaveGroup(userId: string | ObjectId) {
        userId = sanitizeId(userId);

        if (this.creatorIdString === userId.toHexString()) {
            throw createExtendedError({
                message:
                    'The group creator cannot leave the group, only delete it',
                statusCode: 409
            });
        }

        if (!this.groupInfo) {
            throw createExtendedError({
                message: 'The group has not been set to the object',
                statusCode: 500
            });
        }
        const groupId = this.groupInfo._id;

        try {
            await User.removeMember({ userId, groupId });
            if (this.adminIdStrings.includes(userId.toHexString())) {
                await User.removeAdmin({ userId, groupId });
            }

            await groupCollection.findOneAndUpdate(
                { _id: groupId },
                { $pull: { admins: userId as any, members: userId as any } }
            );
        } catch (error) {
            throw error;
        }
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
