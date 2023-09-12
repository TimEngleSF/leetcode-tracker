import inquirer from 'inquirer';
import chalk from 'chalk';
import { printHeader } from '../../utils.js';

export const selectLeaderboard = async () => {
  console.clear();
  printHeader();
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'lbSelection',
      message: 'Select a leaderboard',
      choices: [
        { name: 'Leaderboard By Question', value: 'question' },
        { name: 'Overall Leadeboard', value: 'general' },
      ],
    },
  ]);
  return answer.lbSelection;
};
