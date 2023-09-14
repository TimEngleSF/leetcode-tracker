import { getUserJSON, logout } from '../utils.js';

import inquirer from 'inquirer';

const userJSON = async () => {
  try {
    const userObject = await getUserJSON();
    return userObject;
  } catch (error) {
    const userObject = await logout();
    return userObject;
  }
};

const getAuthSelection = async () => {
  const { LC_USERNAME, LC_ID, LC_TOKEN } = await userJSON();
  if (!LC_USERNAME || !LC_ID || !LC_TOKEN) {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'authSelect',
      message: 'Would you like to login or register?',
      choices: ['Login', 'Register'],
    });
    return answers.authSelect.toLowerCase();
  } else {
    return false;
  }
};

export default getAuthSelection;
