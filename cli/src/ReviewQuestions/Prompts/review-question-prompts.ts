import chalk from 'chalk';
import inquirer from 'inquirer';

import { printHeader } from '../../utils.js';
import { filter, validate } from '../../AddQuestions/Prompts/validation.js';

export const reviewRangePrompt = async (
    prompt = inquirer.prompt
): Promise<{ olderThan: number; newerThan: number } | 'back'> => {
    // TODO: Rename the olderThan and newThan to be less confusing
    // they should be older than X days old and newer than X days old
    const { timeSelection } = await prompt({
        type: 'list',
        name: 'timeSelection',
        message: chalk.green(
            'Please select an option to view questions for review'
        ),
        choices: [
            { name: 'Recent', value: { olderThan: 3, newerThan: 0 } },
            { name: '3 days ago', value: { olderThan: 7, newerThan: 3 } },
            { name: '1 week ago', value: { olderThan: 14, newerThan: 7 } },
            { name: '2 weeks ago', value: { olderThan: 28, newerThan: 14 } },
            { name: '4 weeks ago', value: { olderThan: 365, newerThan: 28 } },
            { name: 'Return Home', value: 'back' }
        ]
    });
    return timeSelection;
};

export const reviewQuestionsTryAgainPrompt = async (): Promise<boolean> => {
    const { tryAgain } = await inquirer.prompt({
        type: 'list',
        name: 'tryAgain',
        message: chalk.red(
            'There was an error retrieving your review questions...'
        ),
        choices: [
            { name: 'Try again', value: true },
            { name: 'Return home', value: false }
        ]
    });

    return tryAgain;
};

export const isAddingResultsPrompt = async (): Promise<boolean> => {
    const { selection } = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Would you like to add your results?',
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false }
        ]
    });
    return selection;
};

interface Question {
    name: string;
    value: { url: string; questNum: number };
}

export const questionSelectPrompt = async (
    formatedQuestions: Question[],
    promptInstance = inquirer.prompt
): Promise<{ url: string; questNum: number } | 'back'> => {
    const { selectionQuestion } = await promptInstance({
        type: 'list',
        name: 'selectionQuestion',
        message: `'Choose a question to review ${chalk.underline(
            'Selection will be opened in default browser'
        )}'`,
        choices: [...formatedQuestions, { name: 'Go Back', value: 'back' }]
    });
    return selectionQuestion;
};

export const reviewResultsPrompt = async (
    promptInstance = inquirer.prompt
): Promise<
    { passed: boolean; speed?: number; language: string } | undefined
> => {
    const answers = await promptInstance([
        {
            type: 'list',
            name: 'passed',
            message: 'Did you pass the question',
            choices: [
                { name: chalk.green('Passed'), value: true },
                { name: chalk.red('Failed'), value: false }
            ]
        },
        {
            type: 'list',
            name: 'addSpeed',
            message: 'Would you like to add the speed of execution?',
            when: (answers) => answers.passed,
            choices: [
                { name: chalk.green('Yes'), value: true },
                { name: chalk.red('No'), value: false }
            ]
        },
        {
            type: 'number',
            name: 'speed',
            message: 'Please enter the speed in ms',
            when: (answers) => answers.addSpeed,
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

    console.clear();
    printHeader();

    const { isConfirmed } = await promptInstance({
        type: 'list',
        name: 'isConfirmed',
        message: `Are your results correct?\n\n  Passed: ${
            answers.passed
                ? chalk.green(answers.passed)
                : chalk.red(answers.passed)
        }${
            answers.speed ? '\n  Speed: ' + answers.speed + 'ms' : ''
        }\n  Language: ${answers.language}\n`,
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false }
        ]
    });
    if (!isConfirmed) {
        console.clear();
        printHeader();
        const { tryAgain } = await promptInstance({
            type: 'list',
            name: 'tryAgain',
            message: 'Would you like to enter your results again?',
            choices: [
                { name: chalk.green('Yes'), value: true },
                { name: chalk.red('No'), value: false }
            ]
        });
        if (tryAgain) {
            const answers = await reviewResultsPrompt();
            return answers;
        } else {
            return;
        }
    }

    return answers;
};

export const axiosErrorPrompt = async (): Promise<boolean> => {
    const { tryAgain } = await inquirer.prompt({
        type: 'list',
        name: 'tryAgain',
        message:
            'An error occured while adding your results. What would you like to do?',
        choices: [
            { name: 'Continue with review questions', value: true },
            { name: 'Return Home', value: false }
        ]
    });
    return tryAgain;
};
