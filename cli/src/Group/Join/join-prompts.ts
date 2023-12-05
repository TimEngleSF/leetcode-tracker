import inquirer from 'inquirer';
import chalk from 'chalk';
import { Group } from '../../Types/api.js';
import { filter, validate } from './validation.js';

export const findOptionSelectionPrompt = async (): Promise<
    'list' | 'search' | 'back'
> => {
    const { findOption } = await inquirer.prompt({
        type: 'list',
        name: 'findOption',
        message: 'How would you like to find a group?',
        choices: [
            { name: 'List', value: 'list' },
            { name: 'Search By Name', value: 'search' },
            { name: 'Go back', value: 'back' }
        ]
    });

    return findOption;
};

export const openOrPrivatePrompt = async (): Promise<boolean | 'back'> => {
    const { isOpen } = await inquirer.prompt({
        type: 'list',
        name: 'isOpen',
        message: 'Which groups would you like to view?',
        choices: [
            { name: 'Open', value: true },
            { name: 'Private', value: false },
            { name: 'Go Back', value: 'back' }
        ]
    });

    return isOpen;
};

export const tryAgainPrompt = async (message: string): Promise<boolean> => {
    const { tryAgain } = await inquirer.prompt({
        type: 'list',
        name: 'tryAgain',
        message,
        choices: [
            { name: 'Try again.', value: true },
            { name: 'Go back', value: false }
        ]
    });
    return tryAgain;
};

export const noGroupsPrompt = async (areOpenGroup: boolean) => {
    console.log(
        chalk.red(
            `There are currently no ${
                areOpenGroup === true ? 'open' : 'private'
            } groups for you to join`
        )
    );
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        }
    ]);
};

export const groupChoicePrompt = async (
    groupsListData: {
        name: string;
        value: string;
    }[]
): Promise<string | 'back'> => {
    const { groupChoice } = await inquirer.prompt({
        type: 'list',
        name: 'groupChoice',
        message: 'Choose a group to join.',
        choices: [...groupsListData, { name: 'Go Back', value: 'back' }]
    });

    return groupChoice;
};

export const passCodePrompt = async (
    groupInfoData: Omit<Group, 'passCode'>
): Promise<string> => {
    const { passCode } = await inquirer.prompt({
        type: 'input',
        name: 'passCode',
        message: `Pleaser enter the passcode for ${groupInfoData.displayName}`,
        filter: filter.passCode,
        validate: validate.passCode
    });

    return passCode;
};
