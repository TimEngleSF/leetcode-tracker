import 'dotenv/config';
import inquirer from 'inquirer';
import axios from 'axios';
import fs from 'fs/promises';
import chalk from 'chalk';

const getRegistrationInfo = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What's your first name? ",
      validate: (input) => {
        return (
          input.length <= 10 || 'First name shoud be 10 or less characters'
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
        return input.length <= 10 || 'Username shoud be 10 or less characters';
      },
    },
    {
      type: 'input',
      name: 'yob',
      message: 'What year were you born?',
      validate: (input) => {
        return (
          input.length === 4 || 'Last initial should be exactly 1 character'
        );
      },
    },
    {
      type: 'input',
      name: 'password',
      message: 'Please choose a simple password: ',
    },
    {
      type: 'input',
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
    await fs.appendFile(
      new URL('../../.env', import.meta.url),
      `
LC_USERNAME="${data.username}"
LC_ID="${data._id}"
LC_TOKEN="${data.token}"
        `
    );
  } catch (error) {
    console.error(error);
  }
};

export default registerUser;
