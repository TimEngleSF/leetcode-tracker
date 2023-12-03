import express from 'express';
import Controllers from '../controllers/index';
const groupRoutes = express.Router();

groupRoutes.post('/create', Controllers.Group.postCreate);

groupRoutes.post('/add-member', Controllers.Group.postMember);

groupRoutes.put('/featured-question', Controllers.Group.putFeaturedQuestion);

groupRoutes.get('/', Controllers.Group.getGroups);

export default groupRoutes;
