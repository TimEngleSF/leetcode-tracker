import chalk from 'chalk';
import axios from 'axios';

import { continuePrompt, getAuthHeaders, printHeader } from '../../../utils.js';
import { API_URL } from '../../../config.js';
import { Group } from '../../../Types/api.js';

const adminDashboardViewPassCode = async (
    groupId: string
): Promise<'back' | void> => {
    console.clear();
    printHeader();

    let groupInfo: Group;
    try {
        const { data } = await axios.get(
            `${API_URL}/group?groupId=${groupId}`,
            {
                headers: await getAuthHeaders()
            }
        );
        groupInfo = data;
    } catch (error: any) {
        const errorMessage = error.response.data.message;
        console.log(
            chalk.red(
                `There was an error getting the passcode: ${errorMessage}`
            )
        );
        await continuePrompt();
        return 'back';
    }

    const passCodeDisplay = `${
        groupInfo.displayName
    }'s code is  ${chalk.bold.bgGreen.red(
        `  ${groupInfo.passCode?.toUpperCase()}  `
    )}`;

    console.clear();
    printHeader();

    if (groupInfo.open) {
        console.log('This group is open and does not have a passcode');
        await continuePrompt();
        return 'back';
    }

    console.log(passCodeDisplay);

    await continuePrompt();

    return 'back';
};

export default adminDashboardViewPassCode;
