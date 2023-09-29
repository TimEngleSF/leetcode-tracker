import inquirer from 'inquirer';

const validateStreetPrompt = async () => {
  const answer = await inquirer.prompt({
    type: 'input',
    name: 'street',
    message: 'What street did you grow up on?',
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
  return answer.street;
};

export default validateStreetPrompt;
