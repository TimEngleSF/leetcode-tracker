import { ObjectId, Db, Collection } from 'mongodb';
import { getCollection } from '../db/connection';
import { ExtendedError, createExtendedError } from '../errors/helpers';
import {
    UserDocument,
    CreateUserInDb,
    addGroupInput,
    addAdminInput
} from '../types/userTypes';
import { injectDb } from './helpers/injectDb';
import { sanitizeId } from './helpers/utility';

export let userCollection: Collection<Partial<UserDocument>>;

export const assignUserCollection = async () => {
    //istanbul ignore next
    if (!userCollection && process.env.NODE_ENV !== 'test') {
        //istanbul ignore next
        userCollection = await getCollection<Partial<UserDocument>>('users');
    }
};

const User = {
    injectDb: (db: Db) => {
        if (process.env.NODE_ENV === 'test') {
            userCollection = injectDb<Partial<UserDocument>>(db, 'users');
        }
    },

    getUser: async (
        key:
            | 'username'
            | '_id'
            | 'email'
            | 'verificationToken'
            | 'passwordToken'
            | 'lastActivity',
        value: string | ObjectId
    ): Promise<UserDocument | null> => {
        try {
            if (key === '_id' && typeof value === 'string') {
                value = new ObjectId(value);
            }
            const result = await userCollection.findOne<UserDocument>({
                [key]: value
            });
            return result;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            const extendedError = new ExtendedError(
                `Database Error: ${error.message}`
            );
            extendedError.stack = error.stack;
            extendedError.statusCode = 500;
            throw extendedError;
        }
    },

    getById: async (_id: string | ObjectId): Promise<UserDocument | null> => {
        try {
            if (typeof _id === 'string') {
                _id = new ObjectId(_id);
            }
            const result = await User.getUser('_id', _id);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getByUsername: async (username: string): Promise<UserDocument | null> => {
        try {
            username = username.toLowerCase().trim();
            const result = await User.getUser('username', username);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getByEmail: async (email: string): Promise<UserDocument | null> => {
        try {
            email = email.toLowerCase().trim();
            const result = await User.getUser('email', email);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getByVerificationToken: async (
        verificationToken: string
    ): Promise<UserDocument | null> => {
        try {
            const result = await User.getUser(
                'verificationToken',
                verificationToken
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    getByPasswordToken: async (
        passwordToken: string
    ): Promise<UserDocument | null> => {
        try {
            const result = await User.getUser('passwordToken', passwordToken);
            return result;
        } catch (error) {
            throw error;
        }
    },

    create: async ({
        displayUsername,
        email,
        hashedPass,
        firstName,
        lastInit,
        verificationToken
    }: CreateUserInDb): Promise<UserDocument> => {
        try {
            firstName = firstName.trim();
            const insertedResult = await userCollection.insertOne({
                username: displayUsername.toLowerCase().trim(),
                displayUsername: displayUsername.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPass,
                firstName: firstName[0].toUpperCase() + firstName.substring(1),
                lastInit: lastInit.toUpperCase(),
                status: 'pending',
                groups: [],
                admins: [],
                created: [],
                questions: [],
                verificationToken,
                passwordToken: '',
                lastActivity: new Date()
            });
            const result = await userCollection.findOne<UserDocument>({
                _id: insertedResult.insertedId
            });

            if (!result) {
                const error = new Error();
                throw error;
            }

            return result;
        } catch (error: any) {
            const extendedError = new ExtendedError(
                'Database Error: There was an error creating user'
            );
            extendedError.statusCode = 500;
            extendedError.stack = error.stack;
            throw extendedError;
        }
    },

    deleteById: async (_id: string | ObjectId) => {
        if (typeof _id === 'string') {
            _id = new ObjectId(_id);
        }

        try {
            await userCollection.deleteOne({ _id });
        } catch (error: any) {
            const extendedError = new ExtendedError(
                'Database Error: There was an error deleting user'
            );
            extendedError.statusCode = 500;
            extendedError.stack = error.stack;
            throw extendedError;
        }
    },

    update: async ({
        _id,
        key,
        value
    }: {
        _id: string | ObjectId;
        key:
            | 'username'
            | 'email'
            | 'password'
            | 'firstName'
            | 'lastInit'
            | 'status'
            | 'verificationToken'
            | 'passwordToken'
            | 'lastActivity';
        value: string | Date;
    }): Promise<UserDocument> => {
        if (typeof _id === 'string') {
            _id = new ObjectId(_id);
        }

        try {
            const updateResult = (await userCollection.findOneAndUpdate(
                { _id },
                { $set: { [key]: value } },
                { projection: { password: 0 }, returnDocument: 'after' }
            )) as UserDocument;

            if (!updateResult) {
                throw new Error();
            }
            return updateResult;
        } catch (error: any) {
            const extendedError = new ExtendedError(
                `Database Error: There was an error updating the user${
                    error.message ? `\n${error.message}` : ''
                }`
            );
            extendedError.statusCode = 500;
            extendedError.stack = error.stack;
            throw extendedError;
        }
    },

    updatePassword: async (
        _id: string | ObjectId,
        hashedPass: string
    ): Promise<UserDocument> => {
        try {
            const result = await User.update({
                _id,
                key: 'password',
                value: hashedPass
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    updateVerificationToken: async (
        _id: string | ObjectId,
        token: string
    ): Promise<UserDocument> => {
        try {
            const result = await User.update({
                _id,
                key: 'verificationToken',
                value: token
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    updatePasswordToken: async (
        _id: string | ObjectId,
        token: string
    ): Promise<UserDocument> => {
        try {
            const result = await User.update({
                _id,
                key: 'passwordToken',
                value: token
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    updateStatus: async (
        _id: string | ObjectId,
        status: 'pending' | 'verified'
    ) => {
        try {
            const result = await User.update({
                _id,
                key: 'status',
                value: status
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    updateLastActivity: async (_id: string | ObjectId) => {
        try {
            const result = await User.update({
                _id,
                key: 'lastActivity',
                value: new Date()
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    addGroup: async ({ userId, groupId }: addGroupInput) => {
        userId = sanitizeId(userId);
        groupId = sanitizeId(groupId);
        try {
            const result = await userCollection.updateOne(
                { _id: userId },
                { $push: { groups: groupId as any } }
            );
            return result.acknowledged;
        } catch (error) {
            throw error;
        }
    },

    addAdmin: async ({ adminId, groupId }: addAdminInput) => {
        adminId = sanitizeId(adminId);
        groupId = sanitizeId(groupId);
        try {
            const result = await userCollection.updateOne(
                { _id: adminId },
                { $push: { admins: groupId as any } }
            );
            return result.acknowledged;
        } catch (error) {
            throw error;
        }
    },

    getUsers: async (userIds: ObjectId[]): Promise<UserDocument[]> => {
        try {
            const result = await userCollection
                .find({ _id: { $in: userIds } })
                .toArray();
            return result as UserDocument[];
        } catch (error) {
            throw error;
        }
    },

    removeMember: async ({
        userId,
        groupId
    }: {
        groupId: ObjectId | string;
        userId: ObjectId | string;
    }) => {
        if (typeof groupId === 'string') {
            groupId = new ObjectId(groupId);
        }
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }

        try {
            await userCollection.findOneAndUpdate(
                { _id: userId },
                { $pull: { groups: groupId as any } }
            );
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error removing user's group: ${error.message}`,
                statusCode: 500
            });
        }
    },

    removeAdmin: async ({
        userId,
        groupId
    }: {
        groupId: ObjectId | string;
        userId: ObjectId | string;
    }) => {
        if (typeof groupId === 'string') {
            groupId = new ObjectId(groupId);
        }
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }

        try {
            await userCollection.findOneAndUpdate(
                { _id: userId },
                { $pull: { admins: groupId as any } }
            );
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error removing user's group: ${error.message}`,
                statusCode: 500
            });
        }
    },

    removeCreated: async ({
        userId,
        groupId
    }: {
        groupId: ObjectId | string;
        userId: ObjectId | string;
    }) => {
        if (typeof groupId === 'string') {
            groupId = new ObjectId(groupId);
        }
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }

        try {
            await userCollection.findOneAndUpdate(
                { _id: userId },
                { $pull: { created: groupId as any } }
            );
        } catch (error: any) {
            throw createExtendedError({
                message: `There was an error removing group from user's created groups: ${error.message}`,
                statusCode: 500
            });
        }
    },

    addCreator: async ({
        adminId,
        groupId
    }: {
        groupId: ObjectId | string;
        adminId: ObjectId | string;
    }) => {
        if (typeof adminId === 'string') {
            adminId = new ObjectId(adminId);
        }

        try {
            const result = await userCollection.updateOne(
                { _id: adminId },
                {
                    $push: {
                        admins: groupId,
                        created: groupId,
                        groups: groupId
                    }
                }
            );
        } catch (error: any) {
            throw createExtendedError({
                message: `Failed to add group's to the user document: ${error.message}`,
                statusCode: 500
            });
        }
    }
};

export default User;
