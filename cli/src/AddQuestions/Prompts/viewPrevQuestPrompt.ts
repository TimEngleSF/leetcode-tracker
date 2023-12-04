import chalk from 'chalk';
import inquirer from 'inquirer';

const viewPrevQuestPrompt = async (prompt = inquirer.prompt) => {
  const answers: { viewPrev: boolean } = await prompt([
    {
      type: 'list',
      name: 'viewPrev',
      message:
        'Would you like to view your previous attempts for this question?',
      choices: [
        { name: chalk.green('Yes'), value: true },
        { name: chalk.red('No'), value: false },
      ],
    },
  ]);

  return answers.viewPrev;
};

export default viewPrevQuestPrompt;
