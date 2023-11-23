import inquirer from 'inquirer';
import { printHeader } from '../../utils.js';

export const selectGroupOption = async (
    prompt = inquirer.prompt,
    testing = false
) => {
    if (!testing) {
        console.clear();
        printHeader();
    }
    const answer = await prompt([
        {
            type: 'list',
            name: 'selectGroupOption',
            message: 'Would you like to join or create a group?',
            choices: [
                { name: 'Join Group', value: 'join' },
                { name: 'Create Group', value: 'create' }
            ]
        }
    ]);
    return answer.selectGroupOption;
};
