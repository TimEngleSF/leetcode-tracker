import inquirer from 'inquirer';
import chalk from 'chalk';

interface Question {
  name: string;
  value: { url: string; questNum: number };
}

export const questionSelectPrompt = async (
  formatedQuestions: Question[],
  promptInstance = inquirer.prompt
) => {
  const { selectionQuestion } = await promptInstance({
    type: 'list',
    name: 'selectionQuestion',
    message: `'Choose a question to review ${chalk.underline(
      'Selection will be opened in default browser'
    )}'`,
    choices: formatedQuestions,
  });
  return selectionQuestion;
};
