import express from 'express';
import Controllers from '../controllers/index';
const usersRoutes = express.Router();

usersRoutes.get('/:userId', Controllers.User.getUserById);

export default usersRoutes;
