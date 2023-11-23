import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import { API_URL } from '../config.js';
import { Group } from '../Types/api.js';
import { addGroupToJSON, getAuthHeaders, printHeader } from '../utils.js';

interface CreateGroupOptions {
    prompt?: typeof inquirer.prompt;
    testing?: boolean;
    errorMessage?: string;
}

const createGroup = async ({
    prompt = inquirer.prompt,
    testing = false,
    errorMessage
}: CreateGroupOptions) => {
    if (!testing) {
        console.clear();
        printHeader();
    }
    // Display an error message if one exists
    if (errorMessage) {
        console.log(chalk.red(errorMessage));
    }

    // Prompt user for group name
    const nameAnswer = await prompt([
        {
            type: 'input',
            name: 'groupName',
            message: 'Enter a group name'
        }
    ]);

    // Make a request to get all groups
    let groups: Omit<Group, 'passCode'>[];

    try {
        const { data } = await axios.get(`${API_URL}/group/`, {
            headers: await getAuthHeaders()
        });
        groups = data as Omit<Group, 'passCode'>[];
    } catch (error: any) {
        await createGroup({
            errorMessage: `There was an error getting groups: ${error.message}`
        });
        return;
    }

    // Check if group name already in use
    const groupNames = groups.map((group) => group.name);
    if (groupNames.includes(nameAnswer.groupName.toLowerCase())) {
        await createGroup({
            errorMessage: 'A group already exists with that name'
        });
    }

    // Let user decide if the group will be open
    const openSelectionAnswer = await prompt([
        {
            type: 'list',
            name: 'isOpen',
            message: 'Will the group be open or require a passcode?',
            choices: [
                { name: 'Open', value: true },
                { name: 'Private', value: false }
            ]
        }
    ]);

    // Send request to create Group
    let createdGroup: Group;
    try {
        const { data } = await axios({
            method: 'POST',
            url: `${API_URL}/group/create`,
            headers: await getAuthHeaders(),
            data: {
                name: nameAnswer.groupName,
                open: openSelectionAnswer.isOpen
            }
        });
        createdGroup = data as Group;
        await addGroupToJSON(data._id);
    } catch (error) {
        await createGroup({
            errorMessage: `There was an error creating your group`
        });
        return;
    }

    // Display message on successful creation
    console.log(
        chalk.green(
            `Your group '${createdGroup.displayName}' has been created successfully!`
        )
    );
    if (!createdGroup.open && createdGroup.passCode) {
        console.log(
            chalk.green(
                `The passcode for your group is: ${createdGroup.passCode}`
            )
        );
    }

    // Wait for user input to end the execution
    await prompt([
        {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        }
    ]);
};

export default createGroup;
