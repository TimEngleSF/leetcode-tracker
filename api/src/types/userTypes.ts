import { Document, ObjectId } from 'mongodb';

export interface UserDocument extends Document {
  _id?: ObjectId;
  username: string;
  displayUsername: string;
  email: string;
  firstName: string;
  lastInit: string;
  password: string;
  status: 'pending' | 'verified';
  verificationToken: string | null;
  questions: number[];
  lastActivity: Date;
}

export interface UserRegisterPayload {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastInit: string;
  lastActivity: Date;
  status: 'pending' | 'verified';
}

export interface UserLoginPayload extends UserRegisterPayload {
  token: string;
}

export type CreateUserInService = {
  displayUsername: string;
  email: string;
  password: string;
  firstName: string;
  lastInit: string;
};

export type CreateUserInDb = {
  displayUsername: string;
  email: string;
  hashedPass: string;
  firstName: string;
  lastInit: string;
};