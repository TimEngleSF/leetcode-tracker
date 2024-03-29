import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import { Collection, ObjectId, Db } from 'mongodb';
import { getCollection } from '../db/connection';
import {
    BlacklistDocument,
    DecodedTokenExpiration
} from '../types/blacklistTypes';
import { injectDb } from './helpers/injectDb';
import { ExtendedError, createExtendedError } from '../errors/helpers';

const { EMAIL_VERIFICATION_SECRET, JWT_SECRET, PASSWORD_VERIFICATION_SECRET } =
    process.env;

export let blacklistCollection: Collection<BlacklistDocument>;

export const assignBlacklistCollection = async () => {
    if (!blacklistCollection && process.env.NODE_ENV !== 'test') {
        blacklistCollection = await getCollection<BlacklistDocument>(
            'blacklistTokens'
        );
    }
};

const Blacklist = {
    injectDb: (db: Db) => {
        if (process.env.NODE_ENV === 'test') {
            blacklistCollection = injectDb<BlacklistDocument>(
                db,
                'blacklistTokens'
            );
        }
    },
    findOne: async ({
        key,
        value
    }: {
        key: '_id' | 'token' | 'exp';
        value: string | ObjectId;
    }) => {
        try {
            const result = await blacklistCollection.findOne({ [key]: value });

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

    findByToken: async (token: string): Promise<BlacklistDocument | null> => {
        try {
            const result = await Blacklist.findOne({
                key: 'token',
                value: token
            });
            return result;
        } catch (error) {
            throw error;
        }
    },

    findById: async (_id: string | ObjectId) => {
        if (typeof _id === 'string') {
            _id = new ObjectId(_id);
        }
        try {
            const result = Blacklist.findOne({ key: '_id', value: _id });
            return result;
        } catch (error) {
            throw error;
        }
    },

    addBlacklistToken: async (
        token: string,
        secretName:
            | 'EMAIL_VERIFICATION_SECRET'
            | 'JWT_SECRET'
            | 'PASSWORD_VERIFICATION_SECRET'
    ) => {
        let decodedToken: DecodedTokenExpiration;
        let payload: { token: string; exp: number };
        let secret;
        if (secretName === 'EMAIL_VERIFICATION_SECRET') {
            secret = EMAIL_VERIFICATION_SECRET;
        } else if (secretName === 'JWT_SECRET') {
            secret = JWT_SECRET;
        } else if (secretName === 'PASSWORD_VERIFICATION_SECRET') {
            secret = PASSWORD_VERIFICATION_SECRET;
        }
        if (!secret) {
            const error = new ExtendedError('Server missing secret');
            error.statusCode = 500;
            throw error;
        }

        try {
            decodedToken = jwt.verify(token, secret) as DecodedTokenExpiration;
        } catch (error: any) {
            if (error instanceof jwt.JsonWebTokenError) {
                const extendedError = createExtendedError({
                    message: 'Invalid token.',
                    statusCode: 401
                });
                throw extendedError;
            } else if (error instanceof jwt.TokenExpiredError) {
                const extendedError = createExtendedError({
                    message: 'Expired token.',
                    statusCode: 401
                });
                throw extendedError;
            } else {
                throw error;
            }
        }
        if (decodedToken.exp) {
            payload = { token, exp: decodedToken.exp * 1000 };
            try {
                const insertedResult = await blacklistCollection.insertOne(
                    payload
                );
                if (!insertedResult.acknowledged) {
                    const error = new ExtendedError(
                        'There was an error inserting token into blacklist'
                    );
                    error.statusCode = 500;
                    throw error;
                }
            } catch (error: any) {
                if (!error.statusCode) {
                    error = new ExtendedError(
                        `Internal Service Error: ${error.message}`
                    );
                    error.statusCode = 500;
                    error.stack = error.stack;
                    throw error;
                }
                throw error;
            }
        }
    },

    removeExpiredTokens: async () => {
        try {
        } catch (error) {}
    }
};
export default Blacklist;
