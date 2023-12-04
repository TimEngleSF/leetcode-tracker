import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../../types/controllerTypes';
import Filter from 'bad-words';
import { faker } from '@faker-js/faker';
import {
    createReqSchema,
    getMembersInfoSchema,
    postMemberSchema,
    putFeaturedQuestionSchema
} from './groupReqSchema';
import Group from '../../models/Group';

const filter = new Filter();

const GroupController = {
    postCreate: async (req: Request, res: Response, next: NextFunction) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;
        const { body } = req;
        const { error } = createReqSchema.validate(req.body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        if (filter.isProfane(body.name)) {
            return res.status(422).send({
                message: 'Validation Error',
                error: 'Use of foul language is prohibited'
            });
        }

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
            return next(error);
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
            await group.addMember(userId, body.passCode);
            const members = group.getMembersStrings();
            if (members.includes(userId)) {
                return res.status(201).send({ status: 'success' });
            } else {
                return res.status(500).send({
                    status: 'error',
                    message: 'There was an error adding member'
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    getGroups: async (req: Request, res: Response, next: NextFunction) => {
        const { query } = req;
        if (query.groupId) {
            const customReq = req as RequestWithUser;
            const userId = customReq.user.userId;
            const group = new Group();
            const groupInfo = await group.setGroup({
                key: '_id',
                value: query.groupId.toString()
            });
            const admins = group.getAdminsAsStrings();
            if (admins.includes(userId)) {
                return res.status(200).send(groupInfo);
            } else {
                return res.status(200).send({ ...groupInfo, passCode: null });
            }
        }
        try {
            const result = await Group.findGroups();
            return res.status(200).send(result);
        } catch (error) {
            return next(error);
        }
    },

    putFeaturedQuestion: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;
        const { body } = req;

        const { error } = putFeaturedQuestionSchema.validate(body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const { groupId, questNum } = body;

        try {
            const group = new Group();
            const groupInfo = await group.setGroup({
                key: '_id',
                value: groupId
            });

            const questInfo = await group.updateFeaturedQuestion({
                adminId: userId,
                questNum
            });

            return res.status(201).send(questInfo);
        } catch (error) {
            return next(error);
        }
    },

    getMembersInfo: async (req: Request, res: Response, next: NextFunction) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;
        const { body } = req;

        const { error } = getMembersInfoSchema.validate(body);
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const { groupId } = body;

        try {
            const group = new Group();
            const groupInfo = await group.setGroup({
                key: '_id',
                value: groupId
            });

            const membersInfo = await group.getMembersInfo(userId);
            return res.status(200).send(membersInfo);
        } catch (error) {
            return next(error);
        }
    }
};

export default GroupController;
