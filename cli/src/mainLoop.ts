import inquirer from 'inquirer';
import chalk from 'chalk';

import { logout, printHeader } from './utils.js';
import loginUser from './Auth/loginUser.js';
import addQuestionToDB from './Questions/addQuestionToDB.js';
import viewPrevQuestPrompt from './Questions/Prompts/viewPrevQuestPrompt.js';
import getAllUserQuestsByQuestNum from './Questions/getAllUserQuestsByQuestNum.js';
import { generalLeaderboard } from './Leaderboard/generalLeaderboard/generalLeaderboard.js';
import { selectLeaderboard } from './Leaderboard/Prompts/selectLeaderboardPrompt.js';
import { questionLeaderboard } from './Leaderboard/questionLeaderboard/questionLeaderboard.js';
import ReviewQuestions from './ReviewQuestions/ReviewQuestions.js';
import Leaderboard from './Leaderboard/Leaderboard.js';

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
        printHeader();
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
          { name: 'Leaderboard', value: 'leaderboard' },
          { name: 'Review Questions', value: 'review' },
          { name: 'Logout', value: 'logout' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);
    console.clear();
    printHeader();
    switch (action.nextAction) {
      case 'addQuestion':
        console.log(chalk.green('Adding question...'));
        questNum = await addQuestionToDB();
        viewPrevQuest = await viewPrevQuestPrompt();
        console.clear();
        printHeader();
        break;
      case 'leaderboard':
        await Leaderboard();
        break;
      case 'review':
        console.clear();
        printHeader();
        await ReviewQuestions();
        console.clear();
        printHeader();
        break;
      case 'logout':
        console.clear();
        await logout();
        console.log(chalk.green('Come back soon!'));
      case 'exit':
        console.log(chalk.red('Exiting LeetCode Tracker'));
        isRunning = false;
        break;
    }
  }
};

export default mainLoop;
