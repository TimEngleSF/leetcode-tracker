import { Document, ObjectId } from 'mongodb';
import { getCollection } from '../db/connection.js';
import { ExtendedError } from '../errors/helpers.js';
import { UserDocument } from '../types/userTypes.js';

const User = {
  getUser: async (
    key: 'username' | '_id' | 'email',
    value: string | ObjectId
  ): Promise<UserDocument> => {
    try {
      const collection = await getCollection('users');
      const result = await collection.findOne<UserDocument>({ [key]: value });
      if (!result) {
        const error = new ExtendedError('No user could be located');
        error.statusCode = 404;
        throw error;
      }
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

  getById: async (_id: string | ObjectId): Promise<UserDocument> => {
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

  getByUsername: async (username: string): Promise<UserDocument> => {
    try {
      username = username.toLowerCase();
      const result = await User.getUser('username', username);
      return result;
    } catch (error) {
      throw error;
    }
  },

  getByEmail: async (email: string): Promise<UserDocument> => {
    try {
      email = email.toLowerCase();
      const result = await User.getUser('email', email);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default User;
