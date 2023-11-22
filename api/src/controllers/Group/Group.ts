import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import { createReqSchema } from './groupReqSchema';
import GroupModel from '../../models/Group';

const Group = {
    postCreate: async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.userId;
        const { error } = createReqSchema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }
        const passCode = faker.string.alphanumeric(6).toLowerCase();
        try {
            const result = await GroupModel.create({
                name: req.body.name,
                adminId: userId,
                passCode
            });
            res.status(201).send({
                ...result,
                passCode: result.passCode.toUpperCase()
            });
        } catch (error) {
            next(error);
        }
    }
};

export default Group;
