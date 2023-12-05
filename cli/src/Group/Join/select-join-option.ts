import inquirer from 'inquirer';
import { printHeader } from '../../utils.js';
import chalk from 'chalk';
// import listOptionPrompt from './list-option.js';
import joinGroupListFlow from './join-group-list-flow.js';
import { PromptOptions } from '../../Types/prompts.js';

export const selectJoinOption = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions) => {
    if (!testing) {
        console.clear();
        printHeader();
    }

    // Display an error message if one exists
    if (errorMessage) {
        console.log(chalk.red(errorMessage));
    }
    // Prompt the user if they would like to find a group via a list or search
    const findOption = await prompt({
        type: 'list',
        name: 'answer',
        message: 'How would you like to find a group?',
        choices: [
            { name: 'List', value: 'list' },
            { name: 'Search By Name', value: 'search' },
            { name: 'Go back', value: 'back' }
        ]
    });
    // THe flow if a user selects list
    if (findOption.answer === 'list') {
        try {
            await joinGroupListFlow();
        } catch (error: any) {
            await selectJoinOption({ errorMessage: error.message });
        }
    }
    if (findOption.answer === 'search') {
        console.log(chalk.red('Coming soon...'));

        await prompt({
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue'
        });
        await selectJoinOption({});
    }

    if (findOption.answer === 'back') {
        return;
    }
};

export default selectJoinOption;
