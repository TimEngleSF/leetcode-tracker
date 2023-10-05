import chalk from 'chalk';
import inquirer from 'inquirer';

const resetPassPrompt = async (): Promise<string> => {
  const { password, passwordCheck } = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: 'Please choose a simple password: ',
      validate: (input) => {
        return (
          (input.length >= 4 && input.length <= 10) ||
          'Password should be between 4 and 10 characters'
        );
      },
    },
    {
      type: 'password',
      name: 'passwordCheck',
      message: 'Please re-enter your password: ',
    },
  ]);

  if (password !== passwordCheck) {
    console.log(chalk.red('Passwords do not match. Please try again.'));
    return await resetPassPrompt();
  }

  return password;
};

export default resetPassPrompt;
