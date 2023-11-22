import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import { createReqSchema } from './groupReqSchema';
import Group from '../../models/Group';

const GroupController = {
    postCreate: async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.userId;
        const { body } = req;
        const { error } = createReqSchema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const passCode =
            body.open === 'true'
                ? null
                : faker.string.alphanumeric(6).toLowerCase();

        try {
            console.log();
            const group = new Group();
            const result = await group.create({
                adminId: userId,
                name: body.name,
                open: body.open === 'true',
                passCode
            });
            res.status(201).send({
                ...result,
                passCode: result.passCode?.toUpperCase() || null
            });
        } catch (error: any) {
            next(error);
        }
    }
};

export default GroupController;
