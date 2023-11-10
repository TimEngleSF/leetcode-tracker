import { Collection, Document, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection.js';
import { ExtendedError } from '../errors/helpers.js';
import { UserDocument, CreateUserInDb } from '../types/userTypes.js';

const User = {
  getUser: async (
    key: 'username' | '_id' | 'email',
    value: string | ObjectId
  ): Promise<UserDocument | null> => {
    try {
      const collection = await getCollection('users');
      const result = await collection.findOne<UserDocument>({ [key]: value });
      return result;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      const extendedError = new ExtendedError(
        `Database Error: ${error.message}`
      );
      extendedError.statusCode = 500;
      throw extendedError;
    }
  },

  getById: async (_id: string | ObjectId): Promise<UserDocument | null> => {
    if (typeof _id === 'string') {
      _id = new ObjectId(_id);
    }
    try {
      const result = await User.getUser('_id', _id);
      return result;
    } catch (error) {
      throw error;
    }
  },

  getByUsername: async (username: string): Promise<UserDocument | null> => {
    try {
      username = username.toLowerCase();
      const result = await User.getUser('username', username);
      return result;
    } catch (error) {
      throw error;
    }
  },

  getByEmail: async (email: string): Promise<UserDocument | null> => {
    try {
      email = email.toLowerCase();
      const result = await User.getUser('email', email);
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
  }: CreateUserInDb): Promise<UserDocument> => {
    let collection: Collection;
    try {
      collection = await getCollection('users');
    } catch (error) {
      throw error;
    }
    try {
      const insertedResult = await collection.insertOne({
        username: displayUsername.toLowerCase(),
        displayUsername,
        email: email.toLowerCase(),
        password: hashedPass,
        firstName,
        lastInit,
        status: 'pending',
        lastActivity: new Date(),
      });
      const result = await collection.findOne<UserDocument>({
        _id: insertedResult.insertedId,
      });

      if (!result) {
        const error = new Error();
        throw error;
      }

      return result;
    } catch (error: any) {
      const catchError = new ExtendedError(
        'Database Error: There was an error creating user'
      );
      catchError.statusCode = 500;
      throw catchError;
    }
  },
};

export default User;
