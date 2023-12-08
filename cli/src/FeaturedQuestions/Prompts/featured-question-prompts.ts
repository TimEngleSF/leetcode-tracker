import inquirer from 'inquirer';
import chalk from 'chalk';

import { validate, filter } from '../../AddQuestions/Prompts/validation.js';
export const featuredQuestionGroupSelectPrompt = async (
    groupChoices: {
        name: string;
        value: { featuredQuestion: number; groupId: string };
    }[]
): Promise<{ featuredQuestion: number; groupId: string } | 'back'> => {
    const { group } = await inquirer.prompt({
        type: 'list',
        name: 'group',
        message: "Choose a group to work on it's Featured Question",
        choices: [
            // TODO: Add chron job on server to get random blind75 question daily to set as Question of the day
            // {
            //     name: "LeetCode Tracker's Question of the Day",
            //     value: 22
            // },
            ...groupChoices,
            { name: 'Go Back', value: 'back' }
        ]
    });

    return group;
};

export const openQuestionInBrowserPrompt = async (): Promise<boolean> => {
    const { userWantsToOpen } = await inquirer.prompt({
        type: 'list',
        name: 'userWantsToOpen',
        message: 'What would you like to do?',
        choices: [
            {
                name: chalk.green('Open LeetCode question in browser'),
                value: true
            },
            { name: chalk.red('Go back to group list'), value: false }
        ]
    });

    return userWantsToOpen;
};

export const addQuestionToDatabasePrompt = async () => {
    const { addQuestionToDb } = await inquirer.prompt({
        type: 'list',
        name: 'addQuestionToDb',
        message: 'Would you like to add your results?',
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false }
        ]
    });

    return addQuestionToDb;
};

export interface UserQuestionInfo {
    isPassed: boolean;
    isAddTimeValid: boolean;
    speed?: number;
    language: string;
}
export const userQuestionInfoPrompt = async (): Promise<UserQuestionInfo> => {
    const userQuestionInfo = await inquirer.prompt([
        {
            type: 'list',
            name: 'isPassed',
            message: 'Did you pass the question?',
            choices: [
                { name: chalk.green('Yes'), value: true },
                { name: chalk.red('No'), value: false }
            ]
        },
        {
            type: 'list',
            name: 'isAddTimeValid',
            message: 'Would you like to add the runtime speed?',
            when: (answers) => answers.isPassed,
            choices: [
                { name: chalk.green('Yes'), value: true },
                { name: chalk.red('No'), value: false }
            ]
        },
        {
            type: 'number',
            name: 'speed',
            message: 'What was the runtime speed in ms?',
            when: (answers) => answers.isAddTimeValid,
            filter: filter.speed,
            validate: validate.speed
        },
        {
            type: 'list',
            name: 'language',
            message: 'Which language did you use?',
            choices: [
                { name: 'C++', value: 'C++' },
                { name: 'Java', value: 'Java' },
                { name: 'Python', value: 'Python' },
                { name: 'Python3', value: 'Python3' },
                { name: 'C', value: 'C' },
                { name: 'C#', value: 'C#' },
                { name: 'JavaScript', value: 'JavaScript' },
                { name: 'TypeScript', value: 'TypeScript' },
                { name: 'PHP', value: 'PHP' },
                { name: 'Swift', value: 'Swift' },
                { name: 'Kotlin', value: 'Kotlin' },
                { name: 'Dart', value: 'Dart' },
                { name: 'Go', value: 'Go' },
                { name: 'Ruby', value: 'Ruby' },
                { name: 'Scala', value: 'Scala' },
                { name: 'Rust', value: 'Rust' },
                { name: 'Racket', value: 'Racket' },
                { name: 'Erland', value: 'Erlang' },
                { name: 'Elixer', value: 'Elixer' }
            ]
        }
    ]);

    return userQuestionInfo;
};

export const isReadyToSubmitPrompt = async (): Promise<boolean> => {
    const { isReadyToSubmit } = await inquirer.prompt({
        type: 'list',
        name: 'isReadyToSubmit',
        message: 'Ready to submit with the information above?',
        choices: [
            { name: chalk.green('Yes, submit!'), value: true },
            { name: chalk.red('No, enter information again'), value: false }
        ]
    });

    return isReadyToSubmit;
};

export const viewLeaderboardPrompt = async (): Promise<boolean> => {
    const { viewLeaderboard } = await inquirer.prompt({
        type: 'list',
        name: 'viewLeaderboard',
        message: 'Would you like to view the leaderboard for this question?',
        choices: [
            { name: chalk.green('Yes'), value: true },
            {
                name: chalk.red('No, return me to the home screen'),
                value: false
            }
        ]
    });

    return viewLeaderboard;
};

export const addAnswerCodePrompt = async (): Promise<boolean> => {
    const { addAnswer } = await inquirer.prompt({
        type: 'list',
        name: 'addAnswer',
        message: "Would you like add your code for other's to view?",
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false }
        ]
    });
    return addAnswer;
};

export const actionSelectionPrompt = async (): Promise<
    'solve' | 'submissions' | 'leaderboard' | 'back'
> => {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            { name: 'Solve Question', value: 'solve' },
            { name: "View member's submissions", value: 'submissions' },
            {
                name: 'View group leaderboard for featured question',
                value: 'leaderboard'
            },
            { name: 'Go back', value: 'back' }
        ]
    });
    return action;
};
