import { rateLimit } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: (req: Request, res: Response, next: NextFunction) => {
    res
      .status(401)
      .json({ message: 'Please wait up to 5 minutes to try again' });
  },
});

export default authRateLimiter;
