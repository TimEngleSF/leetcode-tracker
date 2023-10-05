import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import registrationPrompt from './Prompts/registrationPrompt.js';
import { API_URL } from '../apiConfigInit.js';

const registerToAPI = async (answers: {
  username: string;
  firstName: string;
  lastInit: string;
  password: string;
  secAns: {
    color: string;
    yob: string;
    street: string;
  };
}) => {
  const { username, firstName, lastInit, password, secAns } = answers;
  const payload = {
    username,
    firstName,
    lastInit,
    password,
    secAns,
  };
  try {
    const { data } = await axios({
      method: 'POST',
      url: `${API_URL}/register`,
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    return data;
  } catch (error: any) {
    return error.response?.data || 'An unexpected error occurred';
  }
};

const registerUser = async (): Promise<void> => {
  const answers = await registrationPrompt();
  const registerPayload = {
    username: answers.username.toLowerCase().trim(),
    firstName: answers.firstName.trim(),
    lastInit: answers.lastInit.trim(),
    password: answers.password,
    secAns: {
      color: answers.secColor.toLowerCase().trim(),
      yob: answers.secYOB,
      street: answers.secStreet.toLowerCase().trim(),
    },
  };
  const data = await registerToAPI(registerPayload);

  if (data.message) {
    console.log(chalk.redBright(data.message));
    return await registerUser();
  }

  try {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const userObject = {
      LC_USERNAME: data.username,
      LC_ID: data._id,
      LC_TOKEN: data.token,
    };

    const payload = JSON.stringify(userObject);

    await fs.writeFile(path.join(__dirname, '..', '/user.json'), payload);
  } catch (error) {
    console.error(error);
  }
};

export default registerUser;
