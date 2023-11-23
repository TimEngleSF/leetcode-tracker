import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../../types/controllerTypes';
import { faker } from '@faker-js/faker';
import { createReqSchema, postMemberSchema } from './groupReqSchema';
import Group from '../../models/Group';

const GroupController = {
    postCreate: async (req: Request, res: Response, next: NextFunction) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;
        const { body } = req;
        const { error } = createReqSchema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        console.log(body);

        const passCode = body.open
            ? null
            : faker.string.alphanumeric(6).toLowerCase();

        try {
            const group = new Group();
            const result = await group.create({
                adminId: userId,
                name: body.name.trim(),
                open: body.open,
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
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;
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
    },

    getGroups: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('check');
            const result = await Group.findGroups();
            console.log(result);
            return res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }
};

export default GroupController;
