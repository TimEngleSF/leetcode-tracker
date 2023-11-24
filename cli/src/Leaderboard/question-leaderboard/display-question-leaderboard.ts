import axios from 'axios';
import chalk from 'chalk';

import { getAuthHeaders, fetchQuestionInfo, printHeader } from '../../utils.js';
import { selectQuestionNum } from '../Prompts/selectQuestionNumPrompt.js';
import { createQuestLBDisplay } from './helpers/createQuestLBDisplay.js';
import { API_URL } from '../../config.js';
import writeErrorToFile from '../../errors/writeError.js';
import { QuestionLeaderboardAPIResponse } from '../../Types/api.js';
import inquirer from 'inquirer';

export const questionLeaderboard: any = async ({
    groupId,
    errorMessage
}: {
    groupId?: string;
    errorMessage?: string;
}): Promise<boolean> => {
    // The boolean returns are used to allow a 'Press enter to continue' prompt to execute in parent function
    // when a leaderboard is displayed
    try {
        // Prompt user for the question they want to look up and how to sort
        const { questId, sortingSelection } = await selectQuestionNum(
            inquirer.prompt,
            false,
            errorMessage
        );
        // Fetch info on the question
        const questionData: { questId?: number; title?: string } =
            await fetchQuestionInfo(questId);
        // Store fetched leaderboard data and status code
        let data: QuestionLeaderboardAPIResponse;
        let status: number;
        // If user selected back restart this flow
        if (sortingSelection === 'back') {
            await questionLeaderboard({ groupId });
            return true;
        }
        // Fetch leaderboard
        try {
            const response = await axios({
                method: 'GET',
                url: `${API_URL}/leaderboard/${questId}?sort=${sortingSelection}${
                    groupId ? '&groupId=' + groupId : ''
                }`,
                headers: await getAuthHeaders()
            });

            ({ data, status } = response as {
                data: QuestionLeaderboardAPIResponse;
                status: number;
            });
        } catch (error: any) {
            // Display correct error message if no data on this question number exists in DB
            if (error.response.status === 404) {
                console.log(chalk.red(error.response.data.message));
                const { repeat } = await inquirer.prompt({
                    type: 'list',
                    name: 'repeat',
                    message: 'What would you like to do?',
                    choices: [
                        { name: 'Try again', value: true },
                        { name: 'Return to home screen', value: false }
                    ]
                });
                if (repeat) {
                    await questionLeaderboard({ groupId });
                    return true;
                }
                return false;
            }
            // Display general error message
            console.log(
                chalk.red('There was an error retrieving the leaderboard')
            );
            await inquirer.prompt({
                type: 'input',
                name: 'continue',
                message: 'Press Enter to continue...'
            });
            await questionLeaderboard({ groupId });
            return true;
        }
        // Generate leaderboard table and user's display text
        const { table, userDisplayText } = await createQuestLBDisplay(data);

        // Print To console
        console.clear();
        printHeader();
        console.log(
            chalk.magenta(`${questionData.questId}. ${questionData.title}\n`)
        );
        if (!userDisplayText.includes('undefined')) {
            console.log(userDisplayText);
        }
        console.log(table.toString());
        return true;
    } catch (error: any) {
        try {
            await writeErrorToFile(
                error,
                'Error occured when executing Leaderboard/questionLeaderboard/questionLeaderboard'
            );
            console.log(error);
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
};
