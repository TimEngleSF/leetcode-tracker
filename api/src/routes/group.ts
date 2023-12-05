import express from 'express';
import Controllers from '../controllers/index';
import { group } from 'console';
const groupRoutes = express.Router();

groupRoutes.post('/create', Controllers.Group.postCreate);

groupRoutes.post('/add-member', Controllers.Group.postMember);

groupRoutes.put('/featured-question', Controllers.Group.putFeaturedQuestion);

groupRoutes.get('/members', Controllers.Group.getMembersInfo);

groupRoutes.put('/add-admin', Controllers.Group.putAddAdmin);

groupRoutes.put('/reset-passcode', Controllers.Group.putResetPasscode);

groupRoutes.delete('/remove-member', Controllers.Group.deleteMember);

groupRoutes.delete('/leave-group', Controllers.Group.deleteLeaveGroup);

groupRoutes.delete('/delete-group', Controllers.Group.deleteGroup);

groupRoutes.get('/', Controllers.Group.getGroups);

export default groupRoutes;
