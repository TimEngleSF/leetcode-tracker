import inquirer from 'inquirer';
import { printHeader } from '../../utils.js';
import { validate } from './utils.js';

export const selectQuestionNum = async (
  prompt = inquirer.prompt,
  testing = false
) => {
  if (!testing) {
    console.clear();
    printHeader();
  }
  const answer = await prompt([
    {
      type: 'number',
      name: 'questID',
      message: "Enter a question number to view it's leaderboard",
      validate: validate.questNum,
    },
    {
      type: 'list',
      name: 'sortingSelection',
      message: 'Which leaderboard would you like to view?',
      choices: [
        { name: 'Fastest execution time', value: 'minSpeed' },
        { name: 'Amount of times passed', value: 'passedCount' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);
  return answer;
};
