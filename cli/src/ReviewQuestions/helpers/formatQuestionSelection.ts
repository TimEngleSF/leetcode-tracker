import chalk from 'chalk';

interface Question {
  _id: string;
  questId: number;
  title: string;
  url: string;
  diff: string;
}

export const formatQuestionSelection = (questions: Question[]) => {
  return questions.map((question: Question) => {
    const idString = question.questId.toString().padEnd(5, ' ');
    const titleString = question.title.padEnd(40, ' ');

    const diffString =
      question.diff === 'Easy'
        ? chalk.green('Easy')
        : question.diff === 'Medium'
        ? chalk.yellow('Medium')
        : chalk.red('Hard');

    return {
      name: `${idString}${titleString}${diffString}`,
      value: {
        url: question.url,
        questNum: question.questId,
      },
    };
  });
};
