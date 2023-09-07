import 'dotenv/config';
import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';
import { dir } from 'console';

const getRegistrationInfo = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What's your first name? ",
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'First name shoud be between 2 and 10 characters'
        );
      },
    },
    {
      type: 'input',
      name: 'lastInit',
      message: "What's your last initial? ",
      validate: (input) => {
        return (
          input.length === 1 || 'Last initial should be exactly 1 character'
        );
      },
    },
    {
      type: 'input',
      name: 'username',
      message: 'Enter a username: ',
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Username shoud be between 2 and 10 characters'
        );
      },
    },
    {
      type: 'input',
      name: 'yob',
      message: 'What year were you born?',
      validate: (input) => {
        return (
          input.length === 4 || 'Last initial should be exactly 4 characters'
        );
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please choose a simple password: ',
      validate: (input) => {
        return (
          (input.length >= 4 && input.length <= 10) ||
          'Password shoud be between 4 and 10 characters'
        );
      },
    },
    {
      type: 'password',
      name: 'passwordCheck',
      message: 'Please re-enter your password: ',
      validate: async (input, answers) => {
        return input === answers.password || 'Passwords do not match.';
      },
    },
  ]);

  return answers;
};

const registerToAPI = async (answers: {
  username: string;
  firstName: string;
  lastInit: string;
  yob: string;
  password: string;
}) => {
  const { username, firstName, lastInit, yob, password } = answers;
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/register',
      headers: { 'Content-Type': 'application/json' },
      data: {
        username,
        firstName,
        lastInit,
        yob,
        password,
      },
    });

    return data;
  } catch (error: any) {
    return error.response?.data || 'An unexpected error occurred';
  }
};

const registerUser = async (): Promise<void> => {
  const answers = await getRegistrationInfo();
  const data = await registerToAPI(answers);

  if (data.message) {
    console.log(chalk.redBright(data.message));
    // Optionally, return the user to the registration process to try again
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
