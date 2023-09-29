import inquirer from 'inquirer';

const validateColorPrompt = async () => {
  const answer = await inquirer.prompt({
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

  return answer.color;
};

export default validateColorPrompt;
