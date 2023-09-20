import inquirer from 'inquirer';
import chalk from 'chalk';

export const isAddingResultsPrompt = async (
  promptInstance = inquirer.prompt
) => {
  const { selection } = await promptInstance({
    type: 'list',
    name: 'selection',
    message: 'Would you like to add your results after reviewing question?',
    choices: [
      { name: chalk.green('Yes'), value: true },
      { name: chalk.red('No'), value: false },
    ],
  });
  return selection;
};
