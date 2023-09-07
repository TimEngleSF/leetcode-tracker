import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';
import url from 'url';

import inquirer from 'inquirer';

const userJSON = async () => {
  try {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const data = await fs.readFile(path.join(__dirname, '..', 'user.json'));
    const userObject = JSON.parse(data.toString());
    return userObject;
  } catch (error) {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const userObject = {
      LC_USERNAME: null,
      LC_ID: null,
      LC_TOKEN: null,
    };
    const payload = JSON.stringify(userObject);
    await fs.writeFile(path.join(__dirname, '..', 'user.json'), payload);
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
