import inquirer from 'inquirer';
import chalk from 'chalk';

import {
    continuePrompt,
    fetchQuestionInfo,
    fetchUserAdminGroups,
    fetchUserGroups,
    getUserJSON,
    printHeader
} from '../../utils.js';
import { QuestionInfo } from '../../Types/api.js';
import open from 'open';

// print a list of groups, and from there we will

const featuredQuestionFlow = async () => {
    console.clear();
    printHeader();
    const userData = await getUserJSON();

    if (userData.LC_GROUPS.length < 1) {
        console.log(chalk.bold.yellow('Please join your first group!'));
        await continuePrompt();
        return;
    }

    const userGroups = await fetchUserGroups();

    let groupChoices = userGroups
        .map((group) => {
            if (!group.featuredQuestion) {
                return;
            }
            return { name: group.displayName, value: group.featuredQuestion };
        })
        .filter((group) => group !== undefined) as {
        name: string;
        value: number;
    }[];

    if (userGroups.length < 1) {
        console.log(
            chalk.bold.yellow(
                'None of your groups have featured questions! Let a group admin know.'
            )
        );
        await continuePrompt();
        return;
    }

    const { questNum } = await inquirer.prompt({
        type: 'list',
        name: 'questNum',
        message: "Choose a group to work on it's Featured Question",
        choices: [
            // TODO: Add chron job on server to get random blind75 question daily to set as Question of the day
            // {
            //     name: "LeetCode Tracker's Question of the Day",
            //     value: 22
            // },
            ...groupChoices,
            { name: 'Go Back', value: 'back' }
        ]
    });

    if (questNum === 'back') {
        return;
    }

    let questionInfo: QuestionInfo;

    try {
        questionInfo = await fetchQuestionInfo(questNum);
    } catch (error) {
        console.clear();
        printHeader();

        await inquirer.prompt({
            type: 'confirm',
            name: 'continue',
            message: `${chalk.red(
                `There was an error getting info on the featured question, its LeetCode Id is ${questNum}`
            )}`
        });
        return;
    }

    console.clear();
    printHeader();
    let questDiffText;

    if (questionInfo.diff == 'Easy') {
        questDiffText = chalk.green(questionInfo.diff);
    } else if (questionInfo.diff == 'Medium') {
        questDiffText = chalk.yellow(questionInfo.diff);
    } else {
        questDiffText = chalk.red(questionInfo.diff);
    }
    console.log(
        `${chalk.magenta(
            `${questionInfo.questId} ${questionInfo.title}`
        )}\nDifficulty: ${questDiffText}\n`
    );

    const { userWantsToOpen } = await inquirer.prompt({
        type: 'list',
        name: 'userWantsToOpen',
        message: 'What would you like to do?',
        choices: [
            {
                name: chalk.green('Open LeetCode question in browser'),
                value: true
            },
            { name: chalk.red('Go back to group list'), value: false }
        ]
    });

    if (userWantsToOpen) {
        open(questionInfo.url);
    } else {
        await featuredQuestionFlow();
        return;
    }

    // TODO: Give user option to add question data
    return;
};

export default featuredQuestionFlow;
