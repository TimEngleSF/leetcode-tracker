import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// import writeErrorToFile from '../errors/writeError.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

interface RequestWithUser extends Request {
  user?: jwt.JwtPayload;
}

const isAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    console.log('Attempting to decode...');
    decodedToken = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error: any) {
    if (error instanceof Error) {
      // writeErrorToFile(error, 'Error arrised while authentication user.');
      return res
        .status(500)
        .json({ message: error.message || 'Token could not be decoded' });
    }
  }

  if (!decodedToken) {
    res.status(401).json({ msg: 'Unauthorized' });
  } else {
    console.log('Successfully decoded token...');
    req.user = decodedToken;
    next();
  }
};

export default isAuth;
