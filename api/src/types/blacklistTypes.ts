import { Document, ObjectId } from 'mongodb';
import { JwtPayload } from 'jsonwebtoken';

export interface BlacklistDocument extends Document {
  // _id?: ObjectId;
  token: string;
  exp: number;
}

export interface DecodedTokenExpiration extends JwtPayload {
  exp?: number;
}
