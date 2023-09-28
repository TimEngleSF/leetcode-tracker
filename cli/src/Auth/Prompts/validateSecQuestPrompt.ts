import inquirer from 'inquirer';
import chalk from 'chalk';

const validateSecQuestPrompt = async (repeat = false) => {
  const genAnswers = await inquirer.prompt([
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

  if (repeat) {
    const colorAnswer = await inquirer.prompt({
      type: 'input',
      name: 'color',
      message: 'What is your favorite color?',
      filter: (input) => {
        return input.toLowerCase();
      },
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Answer should be 2 and to characters '
        );
      },
    });

    return { genAnswers, colorAnswer };
  } else {
    const streetAnswer = inquirer.prompt({
      type: 'input',
      name: 'street',
      message: 'What is your favorite street?',
      filter: (input) => {
        return input.toLowerCase();
      },
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Answer should be 2 and to characters '
        );
      },
    });
    return { genAnswers, streetAnswer };
  }
};

export default validateSecQuestPrompt;
