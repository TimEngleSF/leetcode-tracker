import { Request, Response, NextFunction } from 'express';
import UserModel from '../../models/User';

const User = {
    getUserById: async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;

        try {
            const userData = await UserModel.getById(userId);
            if (!userData) {
                return res.status(404).send({
                    status: 'error',
                    message: 'User could not be found'
                });
            }
            return res.status(200).send({
                _id: userData._id,
                admins: userData.admins,
                groups: userData.groups,
                firstName: userData.firstName,
                lastInit: userData.lastInit,
                status: userData.status
            });
        } catch (error) {
            return next(error);
        }
    }
};

export default User;
