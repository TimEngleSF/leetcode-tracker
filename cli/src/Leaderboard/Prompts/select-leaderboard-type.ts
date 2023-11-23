import inquirer from 'inquirer';

const selectLeaderboardTypePrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage = ''
}): Promise<'question' | 'overall' | 'back'> => {
    const { leaderboard } = await prompt({
        type: 'list',
        name: 'leaderboard',
        message: 'Select Leadeboard',
        choices: [
            { name: 'Leaderboard By Question', value: 'question' },
            { name: 'Overall Leadeboard', value: 'overall' },
            { name: 'Back', value: 'back' }
        ]
    });
    return leaderboard;
};

export default selectLeaderboardTypePrompt;
