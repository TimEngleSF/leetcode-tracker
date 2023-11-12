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
