import axios from 'axios';
import inquirer from 'inquirer';

import { getAuthHeaders, getUserJSON, logout } from '../../utils.js';
import { API_URL } from '../../apiConfigInit.js';

const userJSON = async () => {
  try {
    const userObject = await getUserJSON();
    return userObject;
  } catch (error) {
    const userObject = await logout();
    return userObject;
  }
};

const isValidToken = async () => {
  const authHeader = await getAuthHeaders();
  try {
    await axios({
      method: 'GET',
      url: `${API_URL}/validToken`,
      headers: { ...authHeader },
    });
    return true;
  } catch (error) {
    return false;
  }
};

const authSelectionPrompt = async (
  prompt = inquirer.prompt,
  userJSONInstance = userJSON
) => {
  const { LC_USERNAME, LC_ID, LC_TOKEN } = await userJSONInstance();

  if (!LC_USERNAME || !LC_ID || !LC_TOKEN || !(await isValidToken())) {
    const answers = await prompt({
      type: 'list',
      name: 'authSelect',
      message: 'Would you like to login or register?',
      choices: [
        { name: 'Login', value: 'login' },
        { name: 'Register', value: 'register' },
        { name: 'Reset Password', value: 'reset' },
      ],
    });
    return answers.authSelect;
  } else {
    return false;
  }
};

export default authSelectionPrompt;
