import inquirer from 'inquirer';
import chalk from 'chalk';

import { fetchUserGroups } from '../../utils.js';

interface GroupInfo {
    groupId: string;
    groupName: string;
}

export const yourGroupsSelectionPrompt = async (): Promise<
    GroupInfo | 'back'
> => {
    const usersGroupData = await fetchUserGroups();

    const groupChoices = usersGroupData.map((groupData) => ({
        name: groupData.displayName,
        value: { groupId: groupData._id, groupName: groupData.displayName }
    }));

    const { selectedGroup } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedGroup',
            message: 'Select a group',
            choices: [...groupChoices, { name: 'Go Back', value: 'back' }]
        }
    ]);

    return selectedGroup;
};

export const yourGroupOptionsPrompt = async ({
    groupId,
    groupName
}: GroupInfo): Promise<'viewMembers' | 'leaveGroup' | 'back'> => {
    const { groupOption } = await inquirer.prompt({
        type: 'list',
        name: 'groupOption',
        message: 'What would you like to do?',
        choices: [
            { name: 'View Members', value: 'viewMembers' },
            { name: 'Leave Group', value: 'leaveGroup' },
            { name: 'Go Back', value: 'back' }
        ]
    });

    return groupOption;
};

export const yourGroupConfirmLeavePrompt = async ({
    groupId,
    groupName
}: GroupInfo): Promise<'LEAVE' | string> => {
    const { confirmLeave } = await inquirer.prompt({
        type: 'input',
        name: 'confirmLeave',
        message: `Input ${chalk.red(
            'LEAVE'
        )} to confrim you would like to leave ${chalk.bold.green(groupName)}: `
    });

    return confirmLeave;
};
