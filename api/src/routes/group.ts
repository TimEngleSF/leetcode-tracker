import express from 'express';
import Controllers from '../controllers/index';
import { group } from 'console';
const groupRoutes = express.Router();

groupRoutes.post('/create', Controllers.Group.postCreate);

groupRoutes.post('/add-member', Controllers.Group.postMember);

export default groupRoutes;
