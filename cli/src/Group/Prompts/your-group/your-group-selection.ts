import inquirer from 'inquirer';
import chalk from 'chalk';

import { fetchUserGroups } from '../../../utils.js';

const yourGroupsSelectionPrompt = async (): Promise<string | 'back'> => {
    const usersGroupData = await fetchUserGroups();

    const groupChoices = usersGroupData.map((groupData) => ({
        name: groupData.displayName,
        value: groupData._id
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

export default yourGroupsSelectionPrompt;
