import axios, { AxiosInstance } from 'axios';
import inquirer from 'inquirer';
import chalk from 'chalk';
import writeErrorToFile from '../../errors/writeError.js';
import { getAuthHeaders } from '../../utils.js';
import { differenceInDays } from 'date-fns';
import { getDisplayTextForUser, changeTextColorByRank } from '../utils.js';
import { initGeneralTable } from './helpers/utils.js';
import { API_URL } from '../../config.js';
import { GeneralLeaderboardAPIResponse } from '../../Types/api.js';

interface GeneralLeaderboardOptions {
    getAuthHeadersInstance: () => Promise<{ [key: string]: string }>;
    axiosInstance: AxiosInstance;
    writeErrorInstance: (error: any) => void;
    groupId?: string;
}
export const generalLeaderboard: any = async ({
    getAuthHeadersInstance = getAuthHeaders,
    axiosInstance = axios,
    writeErrorInstance = writeErrorToFile,
    groupId
}: GeneralLeaderboardOptions): Promise<boolean> => {
    let data: GeneralLeaderboardAPIResponse;
    let status: number;
    try {
        const authHeader = await getAuthHeadersInstance();
        const response = (await axiosInstance({
            method: 'GET',
            url: `${API_URL}/leaderboard/${
                groupId ? '?groupId=' + groupId : ''
            }`,
            headers: { ...authHeader }
        })) as { data: GeneralLeaderboardAPIResponse };
        ({ data, status } = response as {
            data: GeneralLeaderboardAPIResponse;
            status: number;
        });
    } catch (error: any) {
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
                await generalLeaderboard({ groupId });
                return true;
            }
            return false;
        }
        // Display general error message
        console.log(chalk.red('There was an error retrieving the leaderboard'));
        await inquirer.prompt({
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        });
        // await generalLeaderboard({ groupId });
        return false;
    }
    const completeLeaderData = data.leaderboard.map((leaderData) => {
        const lastActivity = differenceInDays(
            new Date(),
            new Date(leaderData.lastActivity)
        );
        return {
            name: leaderData.name,
            passed: leaderData.passedCount,
            lastActive:
                lastActivity === 0 ? 'Today' : `${lastActivity} days ago`,
            rank: leaderData.rank
        };
    });

    const table = initGeneralTable();

    // TODO: Set this up using the new changeTextColor correctly
    completeLeaderData.forEach(({ rank, lastActive, name, passed }) => {
        const displayRank = changeTextColorByRank(rank, rank);
        const displayName = changeTextColorByRank(rank, name);
        const displayPassedCount = changeTextColorByRank(rank, passed);
        const displaylastActive = changeTextColorByRank(rank, lastActive);

        table.push([
            rank === 1 ? displayRank + ' ' + '🏆' : displayRank,
            displayName,
            displayPassedCount,
            displaylastActive
        ]);
    });

    if (data.user) {
        console.log(`\n${getDisplayTextForUser(data.user)}\n`);
    }
    console.log(table.toString());
    return true;
};
