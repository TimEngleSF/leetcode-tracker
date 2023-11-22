import { JwtPayload } from 'jsonwebtoken';
import { Document, ObjectId } from 'mongodb';

export interface UserDocument extends Document {
    _id: ObjectId;
    username: string;
    displayUsername: string;
    email: string;
    firstName: string;
    lastInit: string;
    password: string;
    status: 'pending' | 'verified';
    verificationToken: string;
    passwordToken: string | null;
    groups: ObjectId[];
    questions: number[];
    lastActivity: Date;
}

export interface UserLoginPayload {
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
    verificationToken: string;
};

export interface UserToken extends JwtPayload {
    userId: string;
    email: string;
    username: string;
}
