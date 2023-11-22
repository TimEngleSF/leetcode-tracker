import 'dotenv/config';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import { Db } from 'mongodb';

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

        if (process.env.NODE_ENV !== 'test') {
            try {
                db = await connectDb();
                await assignUserCollection();
                await assignQuestionCollections();
                await assignBlacklistCollection();
                await assignGroupCollection();
            } catch (error: any) {
                throw new Error(
                    `There was an error establishing connection to db: ${error.message}`
                );
            }
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
