import chalk from 'chalk';
import inquirer from 'inquirer';

export const adminDashboardMemberAction = async (): Promise<
    'remove' | 'admin' | 'back'
> => {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            { name: 'Remove', value: 'remove' },
            { name: 'Make Admin', value: 'admin' },
            { name: 'Go Back', value: 'back' }
        ]
    });

    return action;
};

export const adminDashboardConfirmMemberAction = async (
    action: 'remove' | 'admin',
    memberName: string
): Promise<boolean> => {
    const { confirm } = await inquirer.prompt({
        type: 'list',
        name: 'confirm',
        message: chalk.bold(
            `Please confirm you would like to ${
                action === 'remove' ? 'remove user.' : 'add member as an admin.'
            }`
        ),
        choices: [
            { name: chalk.red('Cancel'), value: false },
            { name: chalk.green('Confirm'), value: true }
        ]
    });
    return confirm;
};
