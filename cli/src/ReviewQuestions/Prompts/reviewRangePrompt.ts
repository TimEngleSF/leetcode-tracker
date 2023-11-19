import chalk from 'chalk';
import inquirer from 'inquirer';

const reviewRangePrompt = async (prompt = inquirer.prompt) => {
  // TODO: Rename the olderThan and newThan to be less confusing
  // they should be older than X days old and newer than X days old
  const answer = await prompt({
    type: 'list',
    name: 'timeSelection',
    message: chalk.green(
      'Please select an option to view questions for review'
    ),
    choices: [
      { name: '3 days ago', value: { olderThan: 7, newerThan: 3 } },
      { name: '1 week ago', value: { olderThan: 14, newerThan: 7 } },
      { name: '2 weeks ago', value: { olderThan: 28, newerThan: 14 } },
      { name: '4 weeks ago', value: { olderThan: 365, newerThan: 28 } },
    ],
  });
  return answer.timeSelection;
};

export default reviewRangePrompt;
