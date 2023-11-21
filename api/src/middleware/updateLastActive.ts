import jwt from 'jsonwebtoken';
import { Collection, ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import connectDb from '../db/connection';

interface RequestWithUser extends Request {
  user?: jwt.JwtPayload;
}

let usersCollection: Collection;

const getCollection = async () => {
  if (usersCollection) {
    return usersCollection;
  }
  const db = await connectDb();
  usersCollection = db.collection('users');
};
getCollection();

const updateLastActive = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ msg: 'Unauthorized' });
  } else {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastActivity: new Date() } }
    );
    next();
  }
};

export default updateLastActive;
