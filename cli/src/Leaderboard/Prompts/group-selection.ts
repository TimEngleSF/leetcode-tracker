import inquirer from 'inquirer';
import { fetchGroups, getUserJSON } from '../../utils.js';
import { Group } from '../../Types/api.js';

const fetchUserGroups = async () => {
    // Get groups that the user belongs to
    const { LC_GROUPS } = await getUserJSON();
    // fetch all group documents from API
    const fetchedGroups = await fetchGroups();
    // Include only groups that the user belongs to
    const filteredGroups = fetchedGroups.filter((group) =>
        LC_GROUPS.includes(group._id)
    );
    return filteredGroups;
};

const generateGroupChoices = (groups: Omit<Group, 'passCode'>[]) => {
    return groups.map((group) => ({
        name: group.displayName,
        value: group._id
    }));
};

const selectGroupPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage = ''
}): Promise<string | 'back'> => {
    const userGroups = await fetchUserGroups();
    const promptChoices = generateGroupChoices(userGroups);
    const { choice } = await prompt({
        type: 'list',
        name: 'choice',
        message: 'Choose a group',
        choices: [...promptChoices, { name: 'Back', value: 'back' }]
    });
    return choice;
};

export default selectGroupPrompt;
