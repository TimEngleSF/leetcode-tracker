import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import connectDb from './db/connection.js';
import routes from './routes/index.js';

import isAuth from './middleware/isAuth.js';
import updateLastActive from './middleware/updateLastActive.js';

const app = express();
const PORT: any = process.env.PORT;

const startServer = async () => {
  try {
    const db = await connectDb();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/', routes.authRouter);

    app.use(isAuth);
    app.get('/validToken', (req, res) => {
      res.status(200).send({ message: 'Token is valid' });
    });
    app.use('/users', routes.usersRoutes);
    app.use(updateLastActive);
    app.use('/questions', routes.questionsRouter);
    app.use('/leaderboard', routes.leaderboardRouter);
    app.use('/review', routes.reviewRouter);

    app.listen(PORT, () => {
      console.log(
        `Connected to ${db.databaseName}. Listening on port: ${PORT}`
      );
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
