import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection.js';
import {
  BlacklistDocument,
  DecodedTokenExpiration,
} from '../types/blacklistTypes.js';
import { ExtendedError } from '../errors/helpers.js';

const { EMAIL_VERIFICATION_SECRET, JWT_SECRET } = process.env;

const Blacklist = {
  findOne: async ({
    key,
    value,
  }: {
    key: '_id' | 'token' | 'exp';
    value: string | ObjectId;
  }) => {
    try {
      const collection = (await getCollection(
        'blacklistTokens'
      )) as Collection<BlacklistDocument>;
      const result = collection.findOne<BlacklistDocument>({ [key]: value });

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
      const result = await Blacklist.findOne({ key: 'token', value: token });
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
    secretName: 'EMAIL_VERIFICATION_SECRET' | 'JWT_SECRET'
  ) => {
    let decodedToken: DecodedTokenExpiration;
    let payload: { token: string; exp: number };
    let secret;
    if (secretName === 'EMAIL_VERIFICATION_SECRET') {
      secret = EMAIL_VERIFICATION_SECRET;
    } else if (secretName === 'JWT_SECRET') {
      secret = JWT_SECRET;
    }
    if (!secret) {
      const error = new ExtendedError('Server missing secret');
      error.statusCode = 500;
      throw error;
    }

    try {
      decodedToken = jwt.verify(token, secret) as DecodedTokenExpiration;
    } catch (error: any) {
      const extendedError = new ExtendedError(
        `There was an error decoding the token: ${error.message}`
      );
      extendedError.statusCode = 500;
      throw extendedError;
    }
    if (decodedToken.exp) {
      payload = { token, exp: decodedToken.exp * 1000 };
      try {
        const collection = (await getCollection(
          'blacklistTokens'
        )) as Collection<BlacklistDocument>;
        const insertedResult = await collection.insertOne(payload);
        if (!insertedResult.acknowledged) {
          const error = new ExtendedError(
            'There was an error inserting token into blacklist'
          );
          error.statusCode = 500;
          throw error;
        }
      } catch (error: any) {
        if (!error.statusCode) {
          error = new ExtendedError(`Internal Service Error: ${error.message}`);
          error.statusCode = 500;
          error.stack = error.stack;
          throw error;
        }
        throw error;
      }
    }
  },

  removeExpiredTokens: async () => {},
};
export default Blacklist;
