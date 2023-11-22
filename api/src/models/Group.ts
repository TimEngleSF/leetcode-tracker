import { Collection, Db, ObjectId, InsertOneResult } from 'mongodb';
import { getCollection } from '../db/connection';
import {
    GroupAssignInput,
    GroupCreateInput,
    GroupDocument,
    GroupKeys
} from '../types/groupTypes';

import { injectDb } from './helpers/injectDb';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import Question from './Question';
import { UserDocument } from '../types';
import { sanitizeId } from './helpers/utility';

export let groupCollection: Collection<Partial<GroupDocument>>;
export const assignGroupCollection = async () => {
    if (!groupCollection && process.env.NODE_ENV !== 'test') {
        groupCollection = await getCollection<Partial<GroupDocument>>('groups');
    }
};

class Group {
    private groupInfo: GroupDocument | null;
    private adminIdStrings: string[];

    constructor() {
        this.groupInfo = null;
        this.adminIdStrings = [];
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
        console.log(name, adminId, passCode);
        console.log(groupCollection.insertOne);
        try {
            insertResult = await groupCollection.insertOne({
                name: name.toLowerCase(),
                displayName: name,
                admins: [adminId],
                members: [adminId],
                questionOfDay: undefined,
                questionOfWeek: undefined,
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

        this.adminIdStrings = result.admins.map((adminId) =>
            adminId.toHexString()
        );
        this.groupInfo = result;

        return result;
    }

    async setGroup({
        adminId,
        key,
        value
    }: {
        adminId: string | ObjectId;
        key: '_id' | 'name';
        value: string | ObjectId;
    }): Promise<GroupAssignInput> {
        adminId = this.isAdmin(adminId);
        let result: GroupDocument | null = null;
        try {
            if (key === '_id') {
                value = sanitizeId(value);
                result = await groupCollection.findOne<GroupDocument>({
                    ['key']: value
                });
            } else if (key === 'name' && typeof value === 'string') {
                result = await groupCollection.findOne<GroupDocument>({
                    ['key']: value.toLowerCase()
                });
            }

            if (!result) {
                throw new Error('Could not find group');
            }

            this.adminIdStrings = result.admins.map((adminId) =>
                adminId.toHexString()
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

    static async findGroups(_id: string | ObjectId): Promise<GroupDocument[]> {
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
