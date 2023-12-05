import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';

import { API_URL } from '../../../config.js';
import { printHeader, continuePrompt, getAuthHeaders } from '../../../utils.js';

const adminDashboardResetPasscodePrompt = async (groupId: string) => {
    console.clear();
    printHeader();
    try {
        const { data } = await axios.get(
            `${API_URL}/group?groupId=${groupId}`,
            { headers: await getAuthHeaders() }
        );

        if (data.open) {
            const { setToPrivate } = await inquirer.prompt({
                type: 'list',
                name: 'setToPrivate',
                message:
                    'This group is currently not set to private, adding a passcode will set it to private',
                choices: [
                    { name: chalk.red('Cancel'), value: false },
                    { name: chalk.green('Set To Private'), value: true }
                ]
            });

            if (!setToPrivate) {
                return;
            }
        }
    } catch (error: any) {
        const errorMessage = error.response.data.message;
        console.log(
            chalk.bold.red(
                `There was an error getting group information: ${errorMessage}`
            )
        );
        await continuePrompt();
    }

    console.clear();
    printHeader();

    const { confirmReset } = await inquirer.prompt({
        type: 'list',
        name: 'confirmReset',
        message:
            'Are you sure you would like to reset the passcode for the group?',
        choices: [
            { name: chalk.red('Cancel'), value: false },
            { name: chalk.green('Confirm'), value: true }
        ]
    });

    if (!confirmReset) {
        return;
    }

    console.clear();
    printHeader();
    try {
        const { data } = await axios({
            method: 'PUT',
            url: `${API_URL}/group/reset-passcode`,
            headers: await getAuthHeaders(),
            data: { groupId }
        });

        const successMessage = `Passcode was successfully reset\nNew Passcode: ${chalk.bold.bgGreen.red(
            `${data.passCode.toUpperCase()}`
        )}`;

        console.log(successMessage);
        await continuePrompt();
    } catch (error: any) {
        console.log(error);
        await continuePrompt();
        const errorMessage = error.response.data.message;
        console.log(
            chalk.bold.red(
                `There was an error resetting the passcode: ${errorMessage}`
            )
        );
        await continuePrompt();
    }
};

export default adminDashboardResetPasscodePrompt;
