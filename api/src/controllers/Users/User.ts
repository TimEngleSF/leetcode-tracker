import { Request, Response, NextFunction } from 'express';
import UserModel from '../../models/User';

const User = {
  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const userData = await UserModel.getById(userId);
      return res.status(200).send(userData);
    } catch (error) {
      next(error);
    }
  },
};

export default User;
