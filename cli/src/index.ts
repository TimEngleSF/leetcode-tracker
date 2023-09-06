import 'dotenv/config';
import { program } from 'commander';

import figlet from 'figlet';
import inquirer from 'inquirer';

import fs from 'fs/promises';

import getAuthSelection from './Auth/getAuthSelection.js';
import registerUser from './Auth/registerUser.js';
import loginUser from './Auth/loginUser.js';
import { getUserJSON } from './utils.js';
import chalk from 'chalk';

let userObject;

// Define the options using Commander
program
  .option('-l, --login', 'Login to your account')
  .option('-a, --add', 'Add question data')
  .option('-b, --dummyB', 'Dummy option B');

// Parse the command line arguments
program.parse();

const options = program.opts();

const printHeader = () => {
  console.log(chalk.cyan(figlet.textSync('LeetCode Tracker')));
};
if (Object.keys(options).length === 0) {
  printHeader();
  console.log(
    `Use ${chalk.magenta('-h')} or ${chalk.magenta('--help')} to view options\n`
  );
}

const authSelect = await getAuthSelection();
if (authSelect === 'register') {
  console.log(chalk.green('Registering user...'));
  await registerUser();
} else if (authSelect === 'login') {
  console.log(chalk.green('Logging in...'));
  await loginUser();
} else {
  console.log(chalk.yellow('Getting user data...'));
  userObject = await getUserJSON();
}

// Run based on options
if (options.login) {
  console.clear();
  printHeader();
  console.log(chalk.green('You have selected the login option.'));
  await loginUser();
}
