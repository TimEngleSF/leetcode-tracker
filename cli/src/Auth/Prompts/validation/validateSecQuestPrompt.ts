import chalk from 'chalk';
import inquirer from 'inquirer';

const validateSecQuestPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter a username: ',
      filter: (input) => {
        return input.toLowerCase();
      },
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Username shoud be between 2 and 10 characters'
        );
      },
    },
    {
      type: 'input',
      name: 'yob',
      message: 'What year were you born?',
      validate: (input) => {
        return (
          input.length === 4 || 'Year of birth should be exactly 4 characters'
        );
      },
    },
  ]);
  return answers;
};

export default validateSecQuestPrompt;
