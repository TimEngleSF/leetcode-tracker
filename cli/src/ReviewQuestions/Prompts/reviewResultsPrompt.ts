import inquirer from 'inquirer';
import chalk from 'chalk';
import { validate } from '../../Questions/Prompts/validation.js';
import { printHeader } from '../../utils.js';

export const reviewResultsPrompt = async (promptInstance = inquirer.prompt) => {
  const answers = await promptInstance([
    {
      type: 'list',
      name: 'passed',
      message: 'Did you pass the question',
      choices: [
        { name: chalk.green('Passed'), value: true },
        { name: chalk.red('Failed'), value: false },
      ],
    },
    {
      type: 'list',
      name: 'addSpeed',
      message: 'Would you like to add the speed of execution?',
      when: (answers) => answers.passed,
      choices: [
        { name: chalk.green('Yes'), value: true },
        { name: chalk.red('No'), value: false },
      ],
    },
    {
      type: 'number',
      name: 'speed',
      message: 'Please enter the speed in ms',
      when: (answers) => answers.addSpeed,
      validate: validate.speed,
    },
  ]);

  console.clear();
  printHeader();

  const { isConfirmed } = await promptInstance({
    type: 'list',
    name: 'isConfirmed',
    message: `Are your results correct?\n\n  Passed: ${
      answers.passed ? chalk.green(answers.passed) : chalk.red(answers.passed)
    }${answers.speed ? '\n  Speed: ' + answers.speed + 'ms' : ''}\n`,
    choices: [
      { name: chalk.green('Yes'), value: true },
      { name: chalk.red('No'), value: false },
    ],
  });
  if (isConfirmed) {
    return answers;
  } else {
    console.clear();
    printHeader();
    const { tryAgain } = await promptInstance({
      type: 'list',
      name: 'tryAgain',
      message: 'Would you like to enter your results again?',
      choices: [
        { name: chalk.green('Yes'), value: true },
        { name: chalk.red('No'), value: false },
      ],
    });
    if (tryAgain) {
      await reviewResultsPrompt();
    }
  }
};
