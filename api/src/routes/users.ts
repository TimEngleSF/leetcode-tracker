import express from 'express';
import Controllers from '../controllers/index';
const usersRoutes = express.Router();

usersRoutes.get('/:userID', Controllers.Users.getUserByID);

export default usersRoutes;
