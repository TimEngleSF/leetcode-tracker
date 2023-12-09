import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';

import path from 'path';
import morgan from 'morgan';
import { Db } from 'mongodb';
import methodOverride from 'method-override';
import connectDb from './db/connection';
import routes from './routes/index';
import isAuth from './middleware/isAuth';
import updateLastActive from './middleware/updateLastActive';
import errorHandler from './middleware/errorHandler';
import { setNodemailerTransport } from './service/Auth/nodemailer-transport';
import { Server } from 'http';
import { assignBlacklistCollection } from './models/Blacklist';
import { assignUserCollection } from './models/User';
import { assignQuestionCollections } from './models/Question';
import { assignGroupCollection } from './models/Group';
import { assignAnswerCollection } from './models/Answer';

export let server: Server;
export const app = express();
const PORT: number | string =
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'dev'
        ? process.env.PORT || 3000
        : 0;

export const startServer = async (): Promise<Server> => {
    try {
        let db: Db;
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '/views'));
        setNodemailerTransport();
        if (process.env.NODE_ENV === 'dev') {
            app.use(morgan('dev'));
        }
        if (process.env.NODE_ENV === 'production') {
            app.use(morgan('tiny'));
        }

        if (process.env.NODE_ENV !== 'test') {
            try {
                db = await connectDb();
                await assignUserCollection();
                await assignQuestionCollections();
                await assignBlacklistCollection();
                await assignGroupCollection();
                await assignAnswerCollection();
            } catch (error: any) {
                throw new Error(
                    `There was an error establishing connection to db: ${error.message}`
                );
            }
        }

        app.use(express.json());
        app.use(methodOverride('_method'));
        app.use(express.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, '/public')));
        app.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.render('home');
        });
        app.use('/v1/auth', routes.authRouter);
        app.use('/v1/answers', routes.answerRoutes);

        app.use(isAuth);
        app.use('/v1/users', routes.usersRoutes);
        app.use(updateLastActive);
        app.use('/v1/questions', routes.questionsRouter);
        app.use('/v1/leaderboard', routes.leaderboardRouter);
        app.use('/v1/group', routes.groupRoutes);
        app.use(errorHandler);
        server = app.listen(PORT, () => {
            console.log(
                `LC_Tracker API version: ${
                    process.env.npm_package_version
                }\nConnected to ${
                    db ? db.databaseName : 'MongoMemoryServer'
                }. Listening on port: ${PORT}`
            );
        });
        return server;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'dev') {
    startServer();
}
