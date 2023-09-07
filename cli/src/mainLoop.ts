import inquirer from 'inquirer';
import chalk from 'chalk';

import { printHeader } from './utils.js';
import loginUser from './Auth/loginUser.js';

const mainLoop = async () => {
  let isRunning = true;

  while (isRunning) {
    printHeader();
    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: chalk.greenBright('What would you like to do?'),
        choices: [
          'Add Question Result',
          'Review Questions',
          'View History',
          'Leaderboard',
          'Login',
          'Logout',
          'Exit',
        ],
      },
    ]);
    console.clear();
    printHeader();

    switch (action.nextAction) {
      case 'Login':
        console.log(chalk.green('Logging in...'));
        await loginUser();
        break;
      case 'Add Question':
        console.log(chalk.green('Adding question...'));
        // Code
        break;
      case 'Dummy Option B':
        console.log(chalk.green('Executing dummy option B'));
        // Code
        break;
      case 'Exit':
        console.log(chalk.red('Exiting LeetCode Tracker'));
        isRunning = false;
        break;
    }
  }
};

export default mainLoop;
