import inquirer from 'inquirer';
import chalk from 'chalk';

import { printHeader } from './utils.js';
import loginUser from './Auth/loginUser.js';
import addQuestionToDB from './Questions/addQuestionToDB.js';
import viewPrevQuestPrompt from './Prompts/viewPrevQuestPrompt.js';
import getAllUserQuestsByQuestNum from './Questions/getAllUserQuestsByQuestNum.js';

const mainLoop = async () => {
  let isRunning = true;
  let questNum: any;
  let viewPrevQuest = false;

  loop: while (isRunning) {
    // Section for Breaking loop
    if (viewPrevQuest) {
      await getAllUserQuestsByQuestNum(questNum);
      const action = await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to continue?',
        default: true,
      });
      if (action.continue) {
        console.clear();
        viewPrevQuest = false;
      } else {
        isRunning = false;
        break loop;
      }
    }

    // Main Section
    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: chalk.greenBright('What would you like to do?'),
        choices: [
          { name: 'Add Question Result', value: 'addQuestion' },
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
      case 'addQuestion':
        console.log(chalk.green('Adding question...'));
        questNum = await addQuestionToDB();
        viewPrevQuest = await viewPrevQuestPrompt();

        console.clear();
        printHeader();
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
