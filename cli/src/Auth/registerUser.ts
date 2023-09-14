import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import registrationPrompt from './Prompts/registrationPrompt.js';

const registerToAPI = async (answers: {
  username: string;
  firstName: string;
  lastInit: string;
  yob: string;
  password: string;
}) => {
  const { username, firstName, lastInit, yob, password } = answers;
  const payload = {
    username: username.toLowerCase().trim(),
    firstName: firstName.trim(),
    lastInit: lastInit.trim(),
    yob,
    password,
  };
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/register',
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
  const data = await registerToAPI(answers);

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
