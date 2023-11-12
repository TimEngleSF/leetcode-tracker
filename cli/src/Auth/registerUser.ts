import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import registrationPrompt from './Prompts/registrationPrompt.js';
import { API_URL } from '../apiConfigInit.js';
import { RegistrationPrompt } from '../Types/prompts.js';

const registerToAPI = async (answers: RegistrationPrompt) => {
  const { username, email, firstName, lastInit, password } = answers;
  const payload = {
    username,
    email,
    firstName,
    lastInit,
    password,
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
    username: answers.username.trim(),
    email: answers.email.trim(),
    firstName: answers.firstName.trim(),
    lastInit: answers.lastInit.trim(),
    password: answers.password,
  };
  const data = await registerToAPI(registerPayload);

  if (data.message) {
    console.log(chalk.redBright(data.message, data.error));
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
