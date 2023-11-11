import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  emailSchema,
  usernameFirstNameSchema,
  lastInitSchema,
  passwordSchema,
} from './validation/validationSchema.js';

const registrationPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter an email: ',
      validate: (input) => {
        const { error } = emailSchema.validate(input);
        return error ? error.message : true;
      },
    },
    {
      type: 'input',
      name: 'username',
      message: 'Enter a username: ',
      validate: (input) => {
        const { error } = usernameFirstNameSchema.validate(input);
        return error ? error.message : true;
      },
    },
    {
      type: 'input',
      name: 'firstName',
      message: "What's your first name? ",
      validate: (input) => {
        const { error } = usernameFirstNameSchema.validate(input);
        return error ? error.message : true;
      },
    },
    {
      type: 'input',
      name: 'lastInit',
      message: "What's your last initial? ",
      validate: (input) => {
        const { error } = lastInitSchema.validate(input);
        return error ? error.message : true;
      },
    },

    {
      type: 'password',
      name: 'password',
      message: 'Please choose a simple password: ',
      validate: (input) => {
        const { error } = passwordSchema.validate(input);
        return error ? error.message : true;
      },
    },
    {
      type: 'password',
      name: 'passwordCheck',
      message: 'Please re-enter your password: ',
      validate: async (input, answers) => {
        return input === answers.password || 'Passwords do not match.';
      },
    },
    {
      type: 'input',
      name: 'secColor',
      message: `${chalk.bgRed(
        'Security questions to reset password'
      )}\nWhat is your favorite color?`,
      filter: (input) => {
        return input.toLowerCase();
      },
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Answer shoud be between 2 and 10 characters'
        );
      },
    },
    {
      type: 'input',
      name: 'secYOB',
      message: 'What year were you born?',
      validate: (input) => {
        return (
          input.length === 4 || 'Year of birth should be exactly 4 characters'
        );
      },
    },
    {
      type: 'input',
      name: 'secStreet',
      message: 'Which street did you grow up on?',
      filter: (input) => {
        return input.toLowerCase();
      },
      validate: (input) => {
        return (
          (input.length >= 2 && input.length <= 10) ||
          'Answer shoud be between 2 and 10 characters'
        );
      },
    },
  ]);

  return answers;
};

export default registrationPrompt;
