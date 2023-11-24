import axios, { AxiosError } from 'axios';
import chalk from 'chalk';

import { getAuthHeaders, fetchQuestionInfo, printHeader } from '../../utils.js';
import { selectQuestionNum } from '../Prompts/selectQuestionNumPrompt.js';
import { createQuestLBDisplay } from '../question-leaderboard/helpers/createQuestLBDisplay.js';
import { API_URL } from '../../config.js';
import writeErrorToFile from '../../errors/writeError.js';
import { QuestionLeaderboardAPIResponse } from '../../Types/api.js';
import inquirer from 'inquirer';

export const questionLeaderboard: any = async (errorMessage?: string) => {
    try {
        const { questId, sortingSelection } = await selectQuestionNum(
            inquirer.prompt,
            false,
            errorMessage
        );
        const authHeader = await getAuthHeaders();
        const questionData: { questId?: number; title?: string } =
            await fetchQuestionInfo(questId);

        let data: QuestionLeaderboardAPIResponse;
        let status: number;

        if (sortingSelection === 'back') {
            await questionLeaderboard();
            return;
        }

        try {
            const response = await axios({
                method: 'GET',
                url: `${API_URL}/leaderboard/${questId}?sort=${sortingSelection}`,
                headers: { ...authHeader }
            });

            ({ data, status } = response as {
                data: QuestionLeaderboardAPIResponse;
                status: number;
            });
        } catch (error: any) {
            if (error.response.status === 404) {
                await questionLeaderboard(error.response.data.message);
                return;
            }
            await questionLeaderboard(
                'There was an error retrieving the leaderboard'
            );
            return;
        }

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
    } catch (error: any) {
        try {
            await writeErrorToFile(
                error,
                'Error occured when executing Leaderboard/questionLeaderboard/questionLeaderboard'
            );
            console.log(error);
        } catch (error) {
            console.log(error);
        }
    }
};
