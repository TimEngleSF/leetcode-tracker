import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import { API_URL } from '../../config.js';
import {
    addAdminToJSON,
    addGroupToJSON,
    continuePrompt,
    fetchQuestionInfo,
    getAuthHeaders,
    printHeader,
    putFeaturedQuestNumber
} from '../../utils.js';
import {
    featuredQuestionPrompt,
    groupNamePrompt,
    isGroupOpenPrompt,
    setFeaturedQuestionPrompt,
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
            await continuePrompt();
        }
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

    const setFeaturedQuestionFlow = async () => {
        const featuredQuestionNum = await featuredQuestionPrompt();

        const featuredQuestionInfo = await fetchQuestionInfo(
            featuredQuestionNum
        );

        console.clear();
        printHeader();
        console.log(
            chalk.magenta(
                `${featuredQuestionInfo.questId}. ${featuredQuestionInfo.title}`
            )
        );

        const { confirmQuestion } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirmQuestion',
            message: 'Is this the correct question?'
        });

        if (!confirmQuestion) {
            const { tryAgain } = await inquirer.prompt({
                type: 'list',
                name: 'tryAgain',
                message: 'Would you like to try a different question?: ',
                choices: [
                    { name: 'Enter another question', value: true },
                    { name: 'Go back', value: false }
                ]
            });

            if (tryAgain) {
                await setFeaturedQuestionFlow();
                return;
            }
            return;
        }

        await putFeaturedQuestNumber(
            featuredQuestionInfo.questId,
            createdGroup._id
        );

        console.clear();
        printHeader();
        console.log(chalk.green('Featured Question has been added!'));
        await continuePrompt();
    };
    const setFeaturedQuestion = await setFeaturedQuestionPrompt();

    if (setFeaturedQuestion) {
        await setFeaturedQuestionFlow();
    }
};

export default createGroupFlow;
