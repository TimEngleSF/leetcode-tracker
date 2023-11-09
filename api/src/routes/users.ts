import express from 'express';
import Controllers from '../controllers/index.js';
const usersRoutes = express.Router();

usersRoutes.get('/:userID', Controllers.Users.getUserByID);

export default usersRoutes;
