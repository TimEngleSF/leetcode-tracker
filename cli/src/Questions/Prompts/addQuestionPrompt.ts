import chalk from 'chalk';
import inquirer from 'inquirer';
import { getQuestionData } from '../../utils.js';
import { validate } from './utils.js';

interface QuestionAnswer {
  questNum: number;
  diff: number;
  passed: boolean;
  speed: number | null;
}
const addQuestionPrompt = async (
  prompt = inquirer.prompt,
  getQuestData = getQuestionData,
  testing = false
): Promise<QuestionAnswer | null> => {
  try {
    const questNumAnswer: {
      questNum: number;
      diff: number;
      passed: boolean;
      speed: number | null;
    } = await prompt([
      {
        type: 'number',
        name: 'questNum',
        message: 'Please enter a question number',
        validate: validate.questNum,
      },
    ]);

    const questData = await getQuestData(questNumAnswer.questNum);
    if (!testing) {
      console.log(
        `\nEntering result for: ${chalk.magenta(
          questData.title
        )}\nDifficulty: ${
          questData.diff === 'Easy'
            ? chalk.green('Easy')
            : questData.diff === 'Medium'
            ? chalk.yellow('Medium')
            : chalk.red('Hard')
        }\n`
      );
    }

    const remainingAnswers = await prompt([
      {
        type: 'list',
        name: 'passed',
        message: 'Did you complete the question?',
        choices: [
          { name: chalk.green('Passed'), value: true },
          { name: chalk.red('Failed'), value: false },
        ],
      },
      {
        type: 'list',
        name: 'isAddTimeValid',
        message: 'Would you like to add the runtime speed?',
        when: (answers) => answers.passed,
        choices: [
          { name: chalk.green('Yes'), value: true },
          { name: chalk.red('No'), value: false },
        ],
      },
      {
        type: 'number',
        name: 'speed',
        message: 'What was the runtime speed in ms?',
        when: (answers) => answers.isAddTimeValid,
        validate: validate.speed,
      },
    ]);

    const answers = {
      ...questNumAnswer,
      ...remainingAnswers,
    };

    return answers;
  } catch (error) {
    const shouldRetry = await prompt({
      type: 'confirm',
      name: 'retry',
      message: 'An error occurred. Would you like to retry?',
    });
    if (shouldRetry.retry) {
      return await addQuestionPrompt();
    } else {
      if (!testing) {
        console.error(chalk.red('Operation was not successful.'));
      }
      return null;
    }
  }
};

export default addQuestionPrompt;
