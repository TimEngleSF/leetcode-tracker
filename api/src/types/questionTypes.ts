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

enum QuestionDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}
export interface QuestionInfoDocument extends Document {
  _id: ObjectId;
  questId: number;
  title: string;
  url: string;
  diff: string;
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

export interface QuestionByUserIdQueryResult {
  questNum?: number;
  passed: boolean;
  speed?: number;
  created: Date;
}

export interface getQuestionsByUserIdResponse {
  general: {
    questNum?: number;
    username: string;
    userId: string;
  };
  questions: QuestionByUserIdQueryResult[];
}

export interface GetGeneralLeaderboardQuery extends Document {
  passedCount: number;
}
