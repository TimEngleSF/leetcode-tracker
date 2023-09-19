import chalk from 'chalk';
import inquirer from 'inquirer';

const reviewRangePrompt = async (prompt = inquirer.prompt) => {
  const answer = await prompt({
    type: 'list',
    name: 'timeSelection',
    message: chalk.green(
      'Please select an option to view questions for review'
    ),
    choices: [
      { name: '3 days ago', value: 3 },
      { name: '1 week ago', value: 7 },
      { name: '2 weeks ago', value: 14 },
      { name: '4 weeks ago', value: 28 },
    ],
  });
  return answer.timeSelection;
};

export default reviewRangePrompt;
