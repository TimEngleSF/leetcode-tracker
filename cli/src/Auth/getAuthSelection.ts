import 'dotenv/config';
import { Command } from 'commander';

import inquirer from 'inquirer';

let LC_USERNAME = process.env.LC_USERNAME;

const getAuthSelection = async () => {
  if (!LC_USERNAME) {
    const answers = await inquirer.prompt({
      type: 'list',
      name: 'authSelect',
      message: 'Would you like to login or register?',
      choices: ['Login', 'Register'],
    });
    return answers.authSelect.toLowerCase();
  }
};

export default getAuthSelection;
