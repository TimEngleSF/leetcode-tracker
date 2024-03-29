import { Request, Response, NextFunction } from 'express';

const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error:', error);
    }
    if (!error.statusCode) {
        error.statusCode = 500;
        error.message = 'Internal Service Error';
    }

    res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        ...(process.env.NODE_ENV === 'dev' && { stack: error.stack })
    });
};

export default errorHandler;
