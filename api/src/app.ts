import 'dotenv/config';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import connectDb from './db/connection';
import routes from './routes/index';

import isAuth from './middleware/isAuth';
import updateLastActive from './middleware/updateLastActive';
import errorHandler from './middleware/errorHandler';
import { setNodemailerTransport } from './service/Auth/nodemailer-transport';

const app = express();
const PORT: any = process.env.PORT;

const startServer = async () => {
  try {
    const db = await connectDb();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views'));
    setNodemailerTransport();
    if (process.env.NODE_ENV === 'dev') {
      app.use(morgan('dev'));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '/public')));
    app.use('/', routes.authRouter);

    app.use(isAuth);
    app.use('/users', routes.usersRoutes);
    app.use(updateLastActive);
    app.use('/questions', routes.questionsRouter);
    app.use('/leaderboard', routes.leaderboardRouter);

    app.use(errorHandler);
    app.listen(PORT, () => {
      console.log(
        `LC_Tracker API version: ${process.env.npm_package_version}\nConnected to ${db.databaseName}. Listening on port: ${PORT}`
      );
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
