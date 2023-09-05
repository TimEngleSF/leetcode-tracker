import 'dotenv/config.js';
import express from 'express';
// @ts-ignore
import morgan from 'morgan';
import connectDb from './db/connection.js';
import routes from './routes/index.js';

const app = express();
const PORT: string | number = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const db = await connectDb();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/', routes.authRouter);

    app.use('/questions', routes.questionsRouter);

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
