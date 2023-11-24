import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface RequestWithUser extends Request {
    user?: jwt.JwtPayload;
}

const updateLastActive = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ msg: 'Unauthorized' });
    } else {
        await User.updateLastActivity(userId);
        return next();
    }
};

export default updateLastActive;
