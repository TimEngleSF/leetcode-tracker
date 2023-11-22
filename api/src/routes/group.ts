import express from 'express';
import Controllers from '../controllers/index';
const groupRoutes = express.Router();

groupRoutes.post('/create', Controllers.Group.postCreate);

export default groupRoutes;
