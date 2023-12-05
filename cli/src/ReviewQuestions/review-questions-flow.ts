import open from 'open';
import { getAuthHeaders, getUserJSON, printHeader } from '../utils.js';
import { fetchReviewQuestions } from './helpers/fetch-review-questions.js';
import { QuestionInfo } from '../Types/api.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import {
    reviewRangePrompt,
    isAddingResultsPrompt,
    questionSelectPrompt,
    reviewQuestionsTryAgainPrompt,
    reviewResultsPrompt
} from './Prompts/review-question-prompts.js';
import { formatQuestionChoices } from './helpers/format-question-choices.js';
import { API_URL } from '../config.js';
import axios from 'axios';

const reviewQuestionsFlow = async () => {
    console.clear();
    printHeader();

    const range = await reviewRangePrompt();

    if (range === 'back') {
        return;
    }

    let reviewQuestions: QuestionInfo[];
    try {
        reviewQuestions = await fetchReviewQuestions(range);
    } catch (error) {
        console.log('There was an error retrieving your review questions...');
        const tryAgain = await reviewQuestionsTryAgainPrompt();
        if (tryAgain) {
            await reviewQuestionsFlow();
            return;
        }
        return;
    }

    const questionChoices = formatQuestionChoices(reviewQuestions);

    const selectedReviewQuestion = await questionSelectPrompt(questionChoices);
    if (selectedReviewQuestion === 'back') {
        await reviewQuestionsFlow();
        return;
    }

    open(selectedReviewQuestion.url);

    const isAddingResults = await isAddingResultsPrompt();
    if (!isAddingResults) {
        return;
    }

    const userResults = await reviewResultsPrompt();
    if (!userResults) {
        return;
    }
    try {
        const userData = await getUserJSON();
        const payload = {
            userId: userData.LC_ID,
            username: userData.LC_USERNAME,
            questNum: selectedReviewQuestion.questNum,
            passed: userResults.passed,
            speed: userResults.speed || null,
            language: userResults.language
        };

        await axios({
            method: 'POST',
            url: `${API_URL}/questions`,
            headers: await getAuthHeaders(),
            data: payload
        });

        await inquirer.prompt({
            type: 'confirm',
            name: 'continue',
            message: `${chalk.green(
                'Your results have been added!'
            )}\nPress Enter to continue...`
        });
    } catch (error) {}
};

export default reviewQuestionsFlow;
