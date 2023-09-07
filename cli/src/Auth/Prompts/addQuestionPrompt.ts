import chalk from 'chalk';
import inquirer from 'inquirer';

const addQuestionPrompt = async () => {
  const answers: {
    questNum: number;
    diff: number;
    passed: boolean;
    speed: number | null;
  } = await inquirer.prompt([
    {
      type: 'number',
      name: 'questNum',
      message: 'Please enter a question number',
      validate: async (number) => {
        return (
          (number <= 9999 && number >= 1) || 'Number should be from 1 to 9999'
        );
      },
    },
    {
      type: 'list',
      name: 'diff',
      message: 'Please select a difficulty',
      choices: [
        { name: chalk.green('Easy'), value: 0 },
        { name: chalk.yellow('Medium'), value: 1 },
        { name: chalk.red('Hard'), value: 2 },
      ],
    },
    {
      type: 'list',
      name: 'passed',
      message: 'Did you complete the question?',
      choices: [
        { name: chalk.green('Passed'), value: true },
        { name: chalk.red('Failed'), value: false },
      ],
    },
    {
      type: 'list',
      name: 'isAddTimeValid',
      message: 'Would you like to add the runtime speed?',
      choices: [
        { name: chalk.green('Yes'), value: true },
        { name: chalk.red('No'), value: false },
      ],
    },
    {
      type: 'number',
      name: 'speed',
      message: 'What was the runtime speed in ms?',
      when: (answers) => answers.isAddTimeValid,
      validate: async (number) => {
        return (
          (number > 0 && number < 10000) ||
          console.log('Number must be between 0 and 10000\nOr no input')
        );
      },
    },
  ]);

  return answers;
};

export default addQuestionPrompt;
