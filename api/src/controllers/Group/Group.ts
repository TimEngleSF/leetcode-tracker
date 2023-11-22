import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import { createReqSchema, postMemberSchema } from './groupReqSchema';
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
    },

    postMember: async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.userId;
        const { body } = req;
        const { error } = postMemberSchema.validate(body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        try {
            const group = new Group();
            const groupDoc = await group.setGroup({
                key: '_id',
                value: body.groupId
            });
            if (!groupDoc.open) {
                if (
                    !body.passCode &&
                    body.passCode?.toLowerCase() !== groupDoc.passCode
                ) {
                    return res.status(401).send({
                        status: 'error',
                        message: 'Missing or invalid passCode'
                    });
                }
            }
            await group.addMember(userId);
            const members = group.getMembersStrings();
            if (group.getMembersStrings().includes(userId)) {
                return res.status(201).send({ status: 'success' });
            } else {
                return res.status(500).send({
                    status: 'error',
                    message: 'There was an error adding member'
                });
            }
        } catch (error) {
            next(error);
        }
    }
};

export default GroupController;
