import inquirer from 'inquirer';
import { printHeader } from '../../utils.js';
import { filter, validate } from './utils.js';
import chalk from 'chalk';

export const selectQuestionNum = async (
  prompt = inquirer.prompt,
  testing = false,
  errorMesssage: string | undefined = undefined
) => {
  if (!testing) {
    console.clear();
    printHeader();
    if (errorMesssage) {
      console.log(chalk.red(errorMesssage));
    }
  }
  const answer = await prompt([
    {
      type: 'number',
      name: 'questId',
      message: "Enter a question number to view it's leaderboard",
      filter: filter.questNum,
      validate: validate.questNum,
    },
    {
      type: 'list',
      name: 'sortingSelection',
      message: 'Which leaderboard would you like to view?',
      choices: [
        { name: 'Fastest execution time', value: 'speed' },
        { name: 'Amount of times passed', value: 'passedCount' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);
  return answer;
};
