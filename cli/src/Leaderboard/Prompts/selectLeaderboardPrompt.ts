import inquirer from 'inquirer';
import { printHeader } from '../../utils.js';

export const selectLeaderboard = async (
  prompt = inquirer.prompt,
  testing = false
) => {
  if (!testing) {
    console.clear();
    printHeader();
  }
  const answer = await prompt([
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
