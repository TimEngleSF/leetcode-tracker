import inquirer from 'inquirer';

const loginPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Please enter your username',
      validate: (input) => {
        return input.length <= 10 || 'Username shoud be 10 or less characters';
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
