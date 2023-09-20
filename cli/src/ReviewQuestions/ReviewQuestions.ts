import open from 'open';
import { questionSelectPrompt } from './Prompts/questionSelectPrompt.js';
import reviewRangePrompt from './Prompts/reviewRangePrompt.js';
import { formatQuestionSelection } from './helpers/formatQuestionSelection.js';
import { getReviewQuestions } from './helpers/getReviewQuestions.js';
import { isAddingResultsPrompt } from './Prompts/isAddingResultsPrompt.js';
import { reviewResultsPrompt } from './Prompts/reviewResultsPrompt.js';
import { addResultsToDB } from './helpers/addResultsToDB.js';
import inquirer from 'inquirer';

const ReviewQuestions = async () => {
  const range = await reviewRangePrompt();
  const questionsList = await getReviewQuestions(range);
  if (!questionsList) {
    const { tryAgain } = await inquirer.prompt({
      type: 'confirm',
      name: 'tryAgain',
      message:
        'You have no review questions in this time range would you like to pick a different range?',
    });
    if (tryAgain) {
      await ReviewQuestions();
      return;
    } else {
      return;
    }
  }
  const promptFormatedList = formatQuestionSelection(questionsList);
  const isAddingResults = await isAddingResultsPrompt();
  const selectedReviewQuestion = await questionSelectPrompt(promptFormatedList);
  open(selectedReviewQuestion.url);
  let reviewResults;
  if (isAddingResults) {
    reviewResults = await reviewResultsPrompt();
    const addSuccess = await addResultsToDB(
      selectedReviewQuestion.questNum,
      reviewResults
    );
  }
};

export default ReviewQuestions;
