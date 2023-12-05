import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import { API_URL } from '../../config.js';
import {
    addAdminToJSON,
    addGroupToJSON,
    continuePrompt,
    getAuthHeaders,
    printHeader
} from '../../utils.js';
import {
    groupNamePrompt,
    isGroupOpenPrompt,
    tryAgainPrompt
} from './create-group-prompts.js';
import { Group } from '../../Types/api.js';

interface CreateGroupOptions {
    prompt?: typeof inquirer.prompt;
    testing?: boolean;
    errorMessage?: string;
}

const createGroupFlow = async () => {
    console.clear();
    printHeader();
    const newGroupName = await groupNamePrompt();

    let groups: Omit<Group, 'passCode'>[];

    try {
        const { data } = await axios.get(`${API_URL}/group`, {
            headers: await getAuthHeaders()
        });
        groups = data as Omit<Group, 'passCode'>[];
    } catch (error: any) {
        console.log(chalk.red('There was an error retrieving groups'));
        await continuePrompt();
        return;
    }

    const groupNames = groups.map((group) => group.name);

    if (groupNames.includes(newGroupName.toLowerCase())) {
        console.log(chalk.red(`${newGroupName} is already in use.`));
        const tryAgain = await tryAgainPrompt();
        if (tryAgain) {
            await createGroupFlow();
        }
        return;
    }

    console.clear();
    printHeader();
    const groupIsOpen = await isGroupOpenPrompt();

    if (groupIsOpen === 'back') {
        await createGroupFlow();
        return;
    }

    let createdGroup: Group;

    try {
        const { data } = await axios({
            method: 'POST',
            url: `${API_URL}/group/create`,
            headers: await getAuthHeaders(),
            data: {
                name: newGroupName,
                open: groupIsOpen
            }
        });

        createdGroup = data as Group;
        await addGroupToJSON(data._id);
        await addAdminToJSON(data._id);

        console.log(
            chalk.green(
                `Your group '${createdGroup.displayName}' has been created successfully!`
            )
        );

        if (!createdGroup.open && createdGroup.passCode) {
            console.log(
                `${chalk.green(
                    'The passcode for your group is:'
                )}  ${chalk.bgGreen.bold.red(
                    ' ' + createdGroup.passCode + ' '
                )}`
            );
        }

        await continuePrompt();
    } catch (error: any) {
        console.clear();
        printHeader();
        const message = error.response.data.message;
        console.log(
            chalk.red(`There was an error creating your group: ${message}`)
        );
        const tryAgain = await tryAgainPrompt();
        if (tryAgain) {
            await createGroupFlow();
        }
        return;
    }
};

export default createGroupFlow;
