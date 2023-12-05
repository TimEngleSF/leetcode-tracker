import inquirer from 'inquirer';

const promptChoices = [
    { name: 'Member Actions', value: 'memberAction' },
    {
        name: 'Update Featured Question',
        value: 'updateFeaturedQuestion'
    },
    { name: 'View Passcode', value: 'viewPasscode' },
    { name: 'Regenerate Passcode', value: 'resetPasscode' },

    { name: 'Go Back', value: 'back' }
];

const adminDashboardOptionsPrompt = async (): Promise<
    | 'memberAction'
    | 'updateFeaturedQuestion'
    | 'viewPasscode'
    | 'resetPasscode'
    | 'back'
> => {
    const { optionSelection } = await inquirer.prompt({
        type: 'list',
        name: 'optionSelection',
        message: 'What would you like to do?',
        choices: promptChoices
    });

    return optionSelection;
};

export default adminDashboardOptionsPrompt;
