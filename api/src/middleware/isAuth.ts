import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createExtendedError } from '../errors/helpers';
// import writeErrorToFile from '../errors/writeError.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
}

interface RequestWithJWT extends Request {
    user?: jwt.JwtPayload;
}

const isAuth = async (
    req: RequestWithJWT,
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
        if (error instanceof jwt.JsonWebTokenError) {
            const extendedError = createExtendedError({
                message: 'Invalid token.',
                statusCode: 401
            });
            throw extendedError;
        } else if (error instanceof jwt.TokenExpiredError) {
            const extendedError = createExtendedError({
                message: 'Expired token.',
                statusCode: 401
            });
            throw extendedError;
        } else {
            throw error;
        }
    }

    if (!decodedToken) {
        res.status(401).json({ msg: 'Unauthorized' });
    } else {
        console.log('Successfully decoded token...');
        req.user = decodedToken;
        return next();
    }
};

export default isAuth;
