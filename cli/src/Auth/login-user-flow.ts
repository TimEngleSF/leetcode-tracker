import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import loginPrompt from './Prompts/login-prompt.js';
import { API_URL } from '../config.js';
import { UserLoginResult } from '../Types/api.js';
import { postLoginUser, tryAgainPrompt } from '../utils.js';

const loginToAPI = async (answers: {
    email: string;
    password: string;
}): Promise<UserLoginResult> => {
    const { email, password } = answers;
    const payload = {
        email: email.toLowerCase().trim(),
        password
    };

    return await postLoginUser({ email, password });
};

export const loginUser = async (email?: string, password?: string) => {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let data;
    let isTesting = false;
    try {
        if (email && password) {
            data = await loginToAPI({ email, password });
            isTesting = true;
        } else {
            const answers = await loginPrompt();
            data = await loginToAPI(answers);
        }

        const userObject = {
            LC_USERNAME: data.user.username.toLowerCase(),
            LC_DISPLAYNAME: data.user.username,
            LC_ID: data.user._id,
            LC_TOKEN: data.token,
            LC_FIRSTNAME: data.user.firstName,
            LC_LASTINIT: data.user.lastInit,
            LC_GROUPS: data.user.groups,
            LC_ADMINS: data.user.admins
        };

        const payload = JSON.stringify(userObject);

        await fs.writeFile(path.join(__dirname, '..', '/user.json'), payload);
        if (!isTesting) {
            console.log(
                chalk.green(
                    `Welcome back ${userObject.LC_FIRSTNAME} ${userObject.LC_LASTINIT}.`
                )
            );
        }
        return;
    } catch (error: any) {
        if (error.response) {
            console.log(chalk.redBright(error.response.data.message));
        } else if (error.code == 'ECONNREFUSED') {
            console.log(chalk.red('There connection was refused.'));
        }
        const tryAgain = await tryAgainPrompt();
        if (tryAgain) {
            await loginUser();
        } else {
            return false;
        }
    }
};

export default loginUser;
