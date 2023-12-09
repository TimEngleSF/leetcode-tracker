import inquirer from 'inquirer';
import chalk from 'chalk';
import { validate, filter } from '../../AddQuestions/Prompts/validation.js';

export const groupNamePrompt = async (): Promise<string> => {
    const { groupName } = await inquirer.prompt({
        type: 'input',
        name: 'groupName',
        message: 'Enter a group name'
    });

    return groupName;
};

export const tryAgainPrompt = async (): Promise<boolean> => {
    const { tryAgain } = await inquirer.prompt({
        type: 'list',
        name: 'tryAgain',
        message: 'Would you like to try again?',
        choices: [
            { name: chalk.green('Try again'), value: true },
            { name: 'Go Back', value: false }
        ]
    });

    return tryAgain;
};

export const isGroupOpenPrompt = async (): Promise<boolean | 'back'> => {
    const { isOpen } = await inquirer.prompt({
        type: 'list',
        name: 'isOpen',
        message: 'Will the group be open or require a passcode?',
        choices: [
            { name: chalk.green('Open'), value: true },
            { name: chalk.red('Private'), value: false },
            { name: 'Go Back', value: 'back' }
        ]
    });

    return isOpen;
};

export const setFeaturedQuestionPrompt = async (): Promise<boolean> => {
    const { setFeaturedQuestion } = await inquirer.prompt({
        type: 'list',
        name: 'setFeaturedQuestion',
        message: 'Would you like to set a featured question?',
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false }
        ]
    });

    return setFeaturedQuestion;
};

export const featuredQuestionPrompt = async (): Promise<number> => {
    const { featuredQuestNum } = await inquirer.prompt({
        type: 'input',
        name: 'featuredQuestNum',
        message:
            'Please input the question number you would like to set the featured question to: ',
        validate: validate.questNum,
        filter: filter.questNum
    });

    return featuredQuestNum;
};
