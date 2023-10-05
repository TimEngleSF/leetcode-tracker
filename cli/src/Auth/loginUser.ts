import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import loginPrompt from './Prompts/loginPrompt.js';
import { API_URL } from '../apiConfigInit.js';

const loginToAPI = async (answers: { username: string; password: string }) => {
  const { username, password } = answers;
  const payload = {
    username: username.toLowerCase().trim(),
    password,
  };
  const { data } = await axios({
    method: 'POST',
    url: `${API_URL}/login`,
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  });

  return data;
};

export const loginUser = async (username?: string, password?: string) => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let data;
  let isTesting = false;
  try {
    if (username && password) {
      data = await loginToAPI({ username, password });
      isTesting = true;
    } else {
      const answers = await loginPrompt();
      data = await loginToAPI(answers);
    }

    const userObject = {
      LC_USERNAME: data.username,
      LC_ID: data._id,
      LC_TOKEN: data.token,
      LC_FIRSTNAME: data.firstName,
      LC_LASTINIT: data.lastInit,
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
