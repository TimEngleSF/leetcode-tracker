import inquirer from 'inquirer';
import chalk from 'chalk';
import { PromptOptions } from '../../Types/prompts.js';
import { filter, validate } from './validation.js';

export const questionNumPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions): Promise<number> => {
    const { questNum } = await prompt({
        type: 'number',
        name: 'questNum',
        message: 'Please enter a question number',
        filter: filter.questNum,
        validate: validate.questNum
    });
    return questNum;
};

export const passedPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions): Promise<boolean | 'back'> => {
    const { passed } = await prompt({
        type: 'list',
        name: 'passed',
        message: 'Did you complete the question?',
        choices: [
            { name: chalk.green('Passed'), value: true },
            { name: chalk.red('Failed'), value: false },
            { name: 'Cancel', value: 'back' }
        ]
    });
    return passed;
};

export const shouldAddSpeedPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions): Promise<boolean | 'back'> => {
    const { addTime } = await prompt({
        type: 'list',
        name: 'addTime',
        message: 'Would you like to add the runtime speed?',
        choices: [
            { name: chalk.green('Yes'), value: true },
            { name: chalk.red('No'), value: false },
            { name: 'Cancel', value: 'back' }
        ]
    });
    return addTime;
};

export const speedPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions): Promise<number> => {
    const { speed } = await prompt({
        type: 'number',
        name: 'speed',
        message: 'What was the runtime speed in ms?',
        filter: filter.speed,
        validate: validate.speed
    });

    return speed;
};

export const languagePrompt = async () => {
    const { language } = await inquirer.prompt({
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
            { name: 'Erlang', value: 'Erlang' },
            { name: 'Elixer', value: 'Elixer' }
        ]
    });

    return language;
};

export const errorPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions): Promise<boolean> => {
    const { repeat } = await prompt({
        type: 'confirm',
        name: 'repeat',
        message: 'There was an error adding your info. Try again?'
    });
    return repeat;
};
