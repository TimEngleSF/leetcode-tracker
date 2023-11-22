import { Collection, Db, ObjectId, InsertOneResult } from 'mongodb';
import { getCollection } from '../db/connection';
import { GroupDocument } from '../types/groupTypes';

import { injectDb } from './helpers/injectDb';
import { ExtendedError } from '../errors/helpers';
import Question from './Question';

export let groupCollection: Collection<Partial<GroupDocument>>;
export const assignGroupCollection = async () => {
    if (!groupCollection && process.env.NODE_ENV !== 'test') {
        groupCollection = await getCollection<Partial<GroupDocument>>('groups');
    }
};

const Group = {
    injectDb: (db: Db) => {
        if (process.env.NODE_ENV === 'test') {
            groupCollection = injectDb(db, 'groups');
        }
    },

    create: async ({
        name,
        adminId,
        passCode
    }: {
        name: string;
        adminId: ObjectId | string;
        passCode: string;
    }) => {
        try {
            if (typeof adminId === 'string') {
                adminId = new ObjectId(adminId);
            }
        } catch (error) {
            throw error;
        }
        let insertResult: InsertOneResult;
        try {
            insertResult = await groupCollection.insertOne({
                name: name.toLowerCase(),
                displayName: name,
                admins: [adminId],
                members: [],
                questionOfDay: undefined,
                questionOfWeek: undefined,
                passCode
            });
        } catch (error: any) {
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

        return result;
    },

    getGroup: async ({
        key,
        value
    }: {
        key: '_id' | 'name';
        value: string | ObjectId;
    }) => {
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
    },

    getGroupById: async (_id: string | ObjectId) => {
        return await Group.getGroup({ key: '_id', value: _id });
    },

    getGroupByName: async (name: string) => {
        return await Group.getGroup({ key: 'name', value: name.toLowerCase() });
    },

    getGroupGeneralLeaderboard: async (
        userId: string | ObjectId,
        groupId: string | ObjectId
    ) => {
        try {
            const result = await Question.getGeneralLeaderboard(
                userId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }
};

export default Group;
