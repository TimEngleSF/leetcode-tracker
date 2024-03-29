import inquirer from 'inquirer';
import {
    localAdminsArray,
    localGroupsArray,
    printHeader
} from '../../utils.js';

export const selectGroupOption = async (
    prompt = inquirer.prompt,
    testing = false
): Promise<
    'groups' | 'join' | 'create' | 'adminDashboard' | 'passCodes' | 'back'
> => {
    if (!testing) {
        console.clear();
        printHeader();
    }
    const groupsArray = await localGroupsArray();
    const adminsArray = await localAdminsArray();

    const userHasGroups = groupsArray.length > 0;
    const userIsAdmin = adminsArray.length > 0;

    let promptChoices = [];
    userHasGroups &&
        promptChoices.push({ name: 'Your Groups', value: 'groups' });

    userIsAdmin &&
        promptChoices.push({
            name: 'Admin Dashboard',
            value: 'adminDashboard'
        });

    promptChoices = [
        ...promptChoices,
        { name: 'Join Group', value: 'join' },
        { name: 'Create Group', value: 'create' }
    ];
    // Of the user is the admin of a group give them the choice to view passcodes

    const answer = await prompt([
        {
            type: 'list',
            name: 'selectGroupOption',
            message: 'Would you like to join or create a group?',
            choices: [...promptChoices, { name: 'Return Home', value: 'back' }]
        }
    ]);
    return answer.selectGroupOption;
};
