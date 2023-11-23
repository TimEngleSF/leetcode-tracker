import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import loginPrompt from './Prompts/loginPrompt.js';
import { API_URL } from '../config.js';
import { UserLoginResult } from '../Types/api.js';

const loginToAPI = async (answers: {
    email: string;
    password: string;
}): Promise<UserLoginResult> => {
    const { email, password } = answers;
    const payload = {
        email: email.toLowerCase().trim(),
        password
    };
    const { data } = await axios({
        method: 'POST',
        url: `${API_URL}/login`,
        headers: { 'Content-Type': 'application/json' },
        data: payload
    });

    return data;
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
            LC_GROUPS: data.user.groups
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
        } else {
            console.log(error);
        }
        await loginUser();
    }
};

export default loginUser;
