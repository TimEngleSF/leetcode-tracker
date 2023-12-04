import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';

import {
    continuePrompt,
    fetchQuestionInfo,
    fetchUserGroups,
    getAuthHeaders,
    getUserJSON,
    printHeader
} from '../utils.js';
import { QuestionInfo, QuestionLeaderboardAPIResponse } from '../Types/api.js';
import open from 'open';
import {
    featuredQuestionGroupSelectPrompt,
    openQuestionInBrowserPrompt,
    addQuestionToDatabasePrompt,
    userQuestionInfoPrompt,
    isReadyToSubmitPrompt,
    UserQuestionInfo,
    viewLeaderboardPrompt
} from './Prompts/featured-question-prompts.js';
import { API_URL } from '../config.js';
import { createQuestLBDisplay } from '../Leaderboard/question-leaderboard/helpers/createQuestLBDisplay.js';

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

    const userWantsToOpen = await openQuestionInBrowserPrompt();

    if (userWantsToOpen) {
        open(questionInfo.url);
    } else {
        await featuredQuestionFlow();
        return;
    }

    console.clear();
    printHeader();
    console.log(questionDisplayText);
    const addQuestionToDb = await addQuestionToDatabasePrompt();

    if (!addQuestionToDb) {
        return;
    }

    const userQuestionInfoFlow = async (): Promise<UserQuestionInfo> => {
        let userQuestionInfo: UserQuestionInfo;

        userQuestionInfo = await userQuestionInfoPrompt();

        console.clear();
        printHeader();
        console.log(questionDisplayText);
        console.log(
            `Passed: ${userQuestionInfo.isPassed}\nSpeed: ${
                userQuestionInfo.speed ? userQuestionInfo.speed : 'N/A'
            }\nLanguage: ${userQuestionInfo.language}\n`
        );

        const isReadyToSubmit = await isReadyToSubmitPrompt();

        if (!isReadyToSubmit) {
            userQuestionInfo = await userQuestionInfoFlow();
        }

        return userQuestionInfo;
    };

    const userQuestionInfo = await userQuestionInfoFlow();

    const payload = {
        userId: userData.LC_ID,
        username: userData.LC_USERNAME,
        questNum,
        passed: userQuestionInfo.isPassed,
        language: userQuestionInfo.language,
        speed: userQuestionInfo.speed || null
    };

    // POST user's question result
    try {
        await axios({
            method: 'POST',
            url: `${API_URL}/questions`,
            headers: await getAuthHeaders(),
            data: payload
        });
    } catch (error) {
        const { repeat } = await inquirer.prompt({
            type: 'confirm',
            name: 'repeat',
            message: chalk.red(
                'There was an error adding your information to the database, would you like to try another featured question?'
            )
        });
        if (repeat) {
            await featuredQuestionFlow();
            return;
        }
        return;
    }

    console.log(chalk.green('Your results have been submitted!'));
    const viewLeaderboad = await viewLeaderboardPrompt();

    console.log(viewLeaderboad);
    await continuePrompt();

    if (viewLeaderboad) {
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
    }
};

export default featuredQuestionFlow;
