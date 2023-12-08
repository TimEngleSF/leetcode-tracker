import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import open from 'open';

import {
    continuePrompt,
    fetchQuestionInfo,
    fetchUserGroups,
    getAuthHeaders,
    getUserJSON,
    printHeader
} from '../utils.js';
import { QuestionInfo, QuestionLeaderboardAPIResponse } from '../Types/api.js';
import {
    featuredQuestionGroupSelectPrompt,
    actionSelectionPrompt
} from './Prompts/featured-question-prompts.js';
import { API_URL } from '../config.js';
import { createQuestLBDisplay } from '../Leaderboard/question-leaderboard/helpers/createQuestLBDisplay.js';
import featuredQuestionAddAnswerFlow from './add-answer-flow.js';

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
            return {
                name: group.displayName,
                value: {
                    featuredQuestion: group.featuredQuestion,
                    groupId: group._id
                }
            };
        })
        .filter((group) => group !== undefined) as {
        name: string;
        value: { featuredQuestion: number; groupId: string };
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

    const selectedGroup = await featuredQuestionGroupSelectPrompt(groupChoices);

    if (selectedGroup === 'back') {
        return;
    }

    let questionInfo: QuestionInfo;

    const questNum = selectedGroup.featuredQuestion;
    const groupId = selectedGroup.groupId;

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

    const questionDisplayText = `${chalk.magenta(
        `${questionInfo.questId} ${questionInfo.title}`
    )}\nDifficulty: ${questDiffText}\n`;
    console.log(questionDisplayText);

    const action = await actionSelectionPrompt();

    if (action === 'back') {
        await featuredQuestionFlow();
        return;
    }

    if (action === 'submissions') {
        open(`${API_URL}/answers/group/${groupId}`);
        await featuredQuestionFlow();
        return;
    }

    if (action === 'solve') {
        await featuredQuestionAddAnswerFlow({
            questNum,
            questionInfoUrl: questionInfo.url,
            questionDisplayText,
            userData
        });

        await featuredQuestionFlow();
        return;
    }

    if (action === 'leaderboard') {
        let data: QuestionLeaderboardAPIResponse;
        let status: number;
        try {
            const response = await axios({
                method: 'GET',
                url: `${API_URL}/leaderboard/${questNum}?sort=speed${
                    groupId ? '&groupId=' + groupId : ''
                }`,
                headers: await getAuthHeaders()
            });

            ({ data, status } = response as {
                data: QuestionLeaderboardAPIResponse;
                status: number;
            });
        } catch (error: any) {
            console.log(
                chalk.red('There was an error retrieving the leaderboard')
            );
            await continuePrompt();
            await featuredQuestionFlow();
            return;
        }

        const { table, userDisplayText } = await createQuestLBDisplay(data);

        console.clear();
        printHeader();
        console.log(questionDisplayText);
        if (!userDisplayText.includes('undefined')) {
            console.log(userDisplayText);
        }
        console.log(table.toString());
        await continuePrompt();
        await featuredQuestionFlow();
    }
};

export default featuredQuestionFlow;
