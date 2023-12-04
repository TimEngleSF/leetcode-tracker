import inquirer from 'inquirer';
import {
    continuePrompt,
    fetchQuestionInfo,
    printHeader,
    putFeaturedQuestNumber
} from '../../../utils.js';
import { validate, filter } from '../../../AddQuestions/Prompts/validation.js';
import chalk from 'chalk';
import adminDashboardOptionsPrompt from './admin-dashboard-options.js';

const adminDashboardUpdateFeaturedQuestPrompt = async (groupId: string) => {
    console.clear();
    printHeader();

    const { featuredQuestNum } = await inquirer.prompt({
        type: 'input',
        name: 'featuredQuestNum',
        message:
            'Please input the question number you would like to set the featured question to',
        validate: validate.questNum,
        filter: filter.questNum
    });

    const featuredQuestionInfo = await fetchQuestionInfo(featuredQuestNum);
    console.clear();
    printHeader();
    console.log(
        chalk.magenta(
            `${featuredQuestionInfo.questId}. ${featuredQuestionInfo.title}`
        )
    );

    const { confirmQuestion } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmQuestion',
        message: 'Is this the correct question?'
    });

    if (!confirmQuestion) {
        const { tryAgain } = await inquirer.prompt({
            type: 'list',
            name: 'tryAgain',
            message: 'Would you like to try a different question?',
            choices: [
                { name: 'Enter another question', value: true },
                { name: 'Go back', value: 'back' }
            ]
        });

        if (tryAgain) {
            await adminDashboardUpdateFeaturedQuestPrompt(groupId);
            return;
        } else {
            await adminDashboardOptionsPrompt();
            return;
        }
    }

    await putFeaturedQuestNumber(featuredQuestionInfo.questId, groupId);

    console.clear();
    printHeader();
    console.log(chalk.green('Featured Question has been updated!'));
    await continuePrompt();

    await adminDashboardOptionsPrompt();
    return;
};

export default adminDashboardUpdateFeaturedQuestPrompt;
