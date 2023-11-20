export interface UserLoginResult {
  user: {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastInit: string;
    lastActivity: Date;
    status: 'pending' | 'verified';
  };
  token: string;
}

export interface QuestionInfo {
  _id: string;
  questId: number;
  title: string;
  url: string;
  diff: string;
}

export interface GeneralLeaderboardEntry {
  userId: string;
  rank: number;
  passedCount: number;
  name: string;
  lastActivity: Date;
}

export interface GeneralLeaderboardUserResult {
  userId: string;
  rank: number | null;
  passedCount: number;
  name: string;
  lastActivity: Date;
}

export interface GeneralLeaderboardAPIResponse {
  user: GeneralLeaderboardUserResult;
  leaderboard: GeneralLeaderboardEntry[];
}

export interface QuestionLeaderboardEntry
  extends Omit<GeneralLeaderboardEntry, 'lastActivity'> {
  minSpeed: number;
  mostRecent: Date;
}

export interface QuestionLeaderboardUserResult
  extends GeneralLeaderboardUserResult {
  minSpeed: number | null;
}

export interface QuestionLeaderboardAPIResponse {
  user: QuestionLeaderboardUserResult;
  leaderboard: QuestionLeaderboardEntry[];
}
