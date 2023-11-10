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
      const collection = (await getCollection(
        'users'
      )) as Collection<UserDocument>;
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
    let collection: Collection<UserDocument>;
    try {
      collection = (await getCollection('users')) as Collection<UserDocument>;
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
        questions: [],
        verificationToken: null,
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

  update: async ({
    _id,
    key,
    value,
  }: {
    _id: string | ObjectId;
    key:
      | 'username'
      | 'email'
      | 'password'
      | 'firstName'
      | 'lastInit'
      | 'status'
      | 'verificationToken';
    value: string;
  }): Promise<UserDocument> => {
    if (typeof _id === 'string') {
      _id = new ObjectId(_id);
    }
    let collection: Collection<UserDocument>;
    try {
      collection = (await getCollection('users')) as Collection<UserDocument>;
    } catch (error) {
      throw error;
    }
    try {
      const updateResult = (await collection.findOneAndUpdate(
        { _id },
        { $set: { [key]: value } },
        { projection: { password: 0 }, returnDocument: 'after' }
      )) as UserDocument;

      if (!updateResult) {
        throw new Error();
      }
      return { ...updateResult };
    } catch (error: any) {
      console.log(error);
      const catchError = new ExtendedError(
        `Database Error: There was an error updating the user\n${error.message}`
      );
      catchError.statusCode = 500;
      throw catchError;
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
        value: token,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default User;
