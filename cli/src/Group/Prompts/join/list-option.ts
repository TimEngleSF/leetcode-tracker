import inquirer from 'inquirer';
import {
    addGroupToJSON,
    fetchGroups,
    joinGroup,
    localGroupsArray
} from '../../../utils.js';
import { Group } from '../../../Types/api.js';
import chalk from 'chalk';
import { filter, validate } from './validation.js';

interface PromptOptions {
    prompt?: typeof inquirer.prompt;
    testing?: boolean;
    errorMessage?: string;
}
const listOptionPrompt = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: PromptOptions) => {
    // THe flow if a user selects list

    // Prompt the user if they would like a list of Open or Private Groups
    const openOption = await prompt({
        type: 'list',
        name: 'answer',
        message: 'Which groups would you like to view?',
        choices: [
            { name: 'Open', value: true },
            { name: 'Private', value: false }
        ]
    });
    // Fetch the groups from API
    let groups: Omit<Group, 'passCode'>[];
    try {
        groups = await fetchGroups();
    } catch (error: any) {
        throw new Error(`There was an error getting groups: ${error.message}`);
    }
    // Filter the list depending on if user wants Open or Private groups
    // Then format those groups to be compatible for prompt choices
    const usersGroups = await localGroupsArray();
    const groupsListData = groups
        .map((group) => {
            if (usersGroups.includes(group._id)) {
                return undefined;
            }
            if (openOption.answer === group.open) {
                return { name: group.displayName, value: group._id };
            }
        })
        .filter(
            (choice): choice is { name: string; value: string } =>
                choice !== undefined
        );

    // If there are no groups for a user to join display a message
    try {
        if (groupsListData.length <= 0) {
            console.log(
                chalk.red(
                    `There are currently no ${
                        openOption.answer === true ? 'open' : 'private'
                    } groups for you to join`
                )
            );
            await prompt([
                {
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }
            ]);
            throw new Error();
        }
    } catch (error) {
        throw error;
    }
    // Prompt the user witha list of groups to join
    const groupChoicePrompt = await prompt({
        type: 'list',
        name: 'answer',
        message: 'Choose a group to join.',
        choices: [...groupsListData, { name: 'Start over', value: 'restart' }]
    });
    // If the user doesnt want any of these groups they can restart
    if (groupChoicePrompt.answer === 'restart') {
        throw new Error();
    }
    // Set the chosen group to variable group
    let [group] = groups.filter(
        (group) => group._id === groupChoicePrompt.answer
    );
    // If the user is attempting to join an Open group follow this flow
    if (openOption.answer === true) {
        try {
            // Make a post request to add user to the members array of the Group

            await joinGroup(groupChoicePrompt.answer);

            // Display a message letting user know they have joined the group.
            console.log(
                chalk.green(`You have successfully joined ${group.displayName}`)
            );
            // Add this group to users local groups array stored in JSON file user.json
            await addGroupToJSON(group._id);
            // Move on after user presses Enter
            await prompt([
                {
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }
            ]);
        } catch (error) {
            // If there is an error start from first prompt and display an error message
            throw new Error('There was an error trying to join');
        }
    }
    // The flow if a user chooses to join a Private group
    if (openOption.answer === false) {
        // Prompt the user for the Group's passcode required to join group
        const passCodePrompt = await prompt({
            type: 'input',
            name: 'answer',
            message: `Please enter the passcode for ${group.name}`,
            filter: filter.passCode,
            validate: validate.passCode
        });

        try {
            // Make a post request to join group
            await joinGroup(group._id, passCodePrompt.answer);
            // Display a message letting the user know they have successfully joined the group
            console.log(
                chalk.green(`You have successfully joined ${group.displayName}`)
            );
            // Add group to users local groups array
            await addGroupToJSON(group._id);
            // Prompt the user to continue
            await prompt([
                {
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter to continue...'
                }
            ]);
        } catch (error: any) {
            // If there is an error start from the beginning and display an error message
            if (error.response.status === 401) {
                throw new Error('Incorrect passcode');
            }
            throw new Error('There was an error trying to join');
        }
    }
};
export default listOptionPrompt;
