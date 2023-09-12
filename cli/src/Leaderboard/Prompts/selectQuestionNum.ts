import inquirer from 'inquirer';
import chalk from 'chalk';
import { printHeader } from '../../utils.js';

export const selectQuestionNum = async () => {
  console.clear();
  printHeader();
  const answer = await inquirer.prompt([
    {
      type: 'number',
      name: 'questID',
      message: "Enter a question number to view it's leaderboard",
      validate: (number) => {
        return (
          (number > 0 && number < 2400) ||
          console.log(chalk.red('\nQuestion number must be between 0 and 2400'))
        );
      },
    },
  ]);
  console.log(answer.questID);
  return answer.questID;
};
