import 'dotenv/config';
import { program } from 'commander';
import chalk from 'chalk';

import mainLoop from './mainLoop.js';
import getAuthSelection from './Auth/getAuthSelection.js';
import registerUser from './Auth/registerUser.js';
import loginUser from './Auth/loginUser.js';
import { getUserJSON, printHeader } from './utils.js';
import getUserLocalData from './getUserLocalData.js';

let userObject;

// Define the options using Commander
program
  .option('-r, --run', 'Begin running an instance of LeetCode Tracker')
  .option('-l, --login', 'Login to your account')
  .option('-a, --add', 'Add question data')
  .option('-b, --dummyB', 'Dummy option B');

// Parse the command line arguments
program.parse();

const options = program.opts();

// If there are no options
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
  userObject = await getUserLocalData();
  console.log(
    chalk.green(`Welcome ${userObject.LC_FIRSTNAME} ${userObject.LC_LASTINIT}`)
  );
}

// Run based on options
if (options.login) {
  console.clear();
  printHeader();
  console.log(chalk.green('You have selected the login option.'));
  await loginUser();
}

if (options.run) {
  console.clear();
  await mainLoop();
}

// Constant runing
