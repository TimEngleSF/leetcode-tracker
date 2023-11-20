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
  userId: ObjectId | string;
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
  questions: Partial<QuestionByUserIdQueryResult>[];
}

export interface GeneralLeaderboardEntry {
  userId: ObjectId;
  passedCount: number;
  name: string;
  rank: number;
  lastActivity: Date;
}
export interface GeneralLeaderboardUserData {
  userId: ObjectId;
  passedCount: number;
  name: string;
  rank?: number | null;
  lastActivity: Date;
}
export interface GetGeneralLeaderboardQuery {
  leaderboardResult: GeneralLeaderboardEntry[];
  userResult: GeneralLeaderboardUserData;
}

export interface QuestionLeaderboardEntry
  extends Omit<GeneralLeaderboardEntry, 'lastActivity'> {
  minSpeed: number;
  mostRecent: Date;
}

export interface QuestionLeaderboardUserData
  extends GeneralLeaderboardUserData {
  minSpeed: number | null;
}

export interface GetQuestionLeaderboardQueryResult {
  leaderboardResult: QuestionLeaderboardEntry[];
  userResult: QuestionLeaderboardUserData;
}
