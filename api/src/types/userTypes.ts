import { Document, ObjectId } from 'mongodb';
export interface UserDocument extends Document {
  _id: ObjectId;
  username: string;
  displayUsername: string;
  email: string;
  firstName: string;
  lastInit: string;
  password: string;
  questions: number[];
  lastActivity: Date;
}

export interface UserLoginRegisterPayload {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastInit: string;
  lastActivity: Date;
  token: string;
}
