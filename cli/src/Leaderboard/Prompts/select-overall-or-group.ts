import inquirer from 'inquirer';

export const selectOverallOrGroupPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage = ''
}): Promise<'group' | 'overall' | 'home'> => {
    const { selection } = await prompt({
        type: 'list',
        name: 'selection',
        message: 'Who should be included in the Leadeboard?',
        choices: [
            { name: 'Group', value: 'group' },
            { name: 'All users', value: 'overall' },
            { name: 'Return home', value: 'home' }
        ]
    });
    return selection;
};
