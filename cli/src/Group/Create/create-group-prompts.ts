import inquirer from 'inquirer';
import chalk from 'chalk';

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
            { name: 'Open', value: true },
            { name: 'Private', value: false },
            { name: 'Go Back', value: 'back' }
        ]
    });

    return isOpen;
};
