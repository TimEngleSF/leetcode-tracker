import inquirer from 'inquirer';
import chalk from 'chalk';
import { emailSchema } from './validation/validationSchema.js';

const loginPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Please enter your email',
      validate: (input) => {
        const { error } = emailSchema.validate(input);
        return error ? chalk.red(error.message) : true;
      },
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please enter your password',
    },
  ]);
  return answers;
};

export default loginPrompt;
