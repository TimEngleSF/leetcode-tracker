import 'dotenv/config';
import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

const loginPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Please enter your username',
      validate: (input) => {
        return input.length <= 10 || 'Username shoud be 10 or less characters';
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please enter your password',
    },
  ]);
  return answers;
};

const loginToAPI = async (answers: { username: string; password: string }) => {
  const { username, password } = answers;
  const { data } = await axios({
    method: 'POST',
    url: 'http://localhost:3000/login',
    headers: { 'Content-Type': 'application/json' },
    data: { username, password },
  });

  return data;
};

const loginUser = async () => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const answers = await loginPrompt();
  const data = await loginToAPI(answers);

  const userObject = {
    LC_USERNAME: data.username,
    LC_ID: data._id,
    LC_TOKEN: data.token,
  };

  const payload = JSON.stringify(userObject);

  await fs.writeFile(path.join(__dirname, '..', '/user.json'), payload);
};

export default loginUser;
