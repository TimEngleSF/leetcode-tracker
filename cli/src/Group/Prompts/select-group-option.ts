import inquirer from 'inquirer';
import { localAdminsArray, printHeader } from '../../utils.js';

export const selectGroupOption = async (
    prompt = inquirer.prompt,
    testing = false
): Promise<'join' | 'create' | 'passCodes' | 'back'> => {
    if (!testing) {
        console.clear();
        printHeader();
    }
    const adminsArray = await localAdminsArray();
    const userIsAdmin = adminsArray.length > 0;

    let promptChoices = [
        { name: 'Join Group', value: 'join' },
        { name: 'Create Group', value: 'create' }
    ];
    // Of the user is the admin of a group give them the choice to view passcodes
    promptChoices = userIsAdmin
        ? [...promptChoices, { name: 'View Passcodes', value: 'passCodes' }]
        : promptChoices;

    const answer = await prompt([
        {
            type: 'list',
            name: 'selectGroupOption',
            message: 'Would you like to join or create a group?',
            choices: [...promptChoices, { name: 'Go back', value: 'back' }]
        }
    ]);
    return answer.selectGroupOption;
};
