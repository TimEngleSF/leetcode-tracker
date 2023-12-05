import inquirer from 'inquirer';
import chalk from 'chalk';
import { continuePrompt, getAuthHeaders, printHeader } from '../../../utils.js';
import { API_URL } from '../../../config.js';
import axios from 'axios';

const adminDashboardDeleteGroupPrompt = async (groupId: string) => {
    console.clear();
    printHeader();

    const { deleteGroupText } = await inquirer.prompt({
        type: 'input',
        name: 'deleteGroupText',
        message: `Enter ${chalk.bold.red(
            'DELETE'
        )} to confirm, otherwise enter anything else: `
    });

    if (deleteGroupText !== 'DELETE') {
        return;
    }

    const { confirmDelete } = await inquirer.prompt({
        type: 'list',
        name: 'confirmDelete',
        message: 'Confirm group deletion...',
        choices: [
            { name: chalk.red('Cancel'), value: false },
            { name: chalk.green('Confirm delete'), value: true }
        ]
    });

    if (!confirmDelete) {
        return;
    }

    console.clear();
    printHeader();

    try {
        await axios({
            method: 'DELETE',
            url: `${API_URL}/group/delete-group`,
            headers: await getAuthHeaders(),
            data: { groupId }
        });

        console.log(chalk.green('Successfully deleted group'));
        await continuePrompt();
    } catch (error: any) {
        const errorMessage = error.response.data.message;
        console.log(
            chalk.bold.red(
                `There was an error deleting the group: ${errorMessage}`
            )
        );
        await continuePrompt();
        return;
    }
};

export default adminDashboardDeleteGroupPrompt;
