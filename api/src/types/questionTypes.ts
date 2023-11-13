import { ObjectId, Document } from 'mongodb';

export interface QuestionDocument extends Document {
  _id: ObjectId;
  userId: ObjectId;
  username: string;
  questNum: number;
  passed: boolean;
  speed?: number;
  created: Date;
}

export type NewQuestion = {
  userId: ObjectId;
  username: string;
  questNum: number;
  passed: boolean;
  speed?: number;
  created: Date;
};

export type AddQuestionRequest = {
  userId: string;
  username: string;
  questNum: number;
  passed: boolean;
  speed?: number;
};
