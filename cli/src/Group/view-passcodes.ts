import inquirer from 'inquirer';
import { getAuthHeaders, localAdminsArray } from '../utils.js';
import { Group } from '../Types/api.js';
import axios from 'axios';
import { API_URL } from '../config.js';
import Table from 'cli-table3';
import chalk from 'chalk';

const adminDashboardViewPasscodes = async () => {
    const adminsArray = await localAdminsArray();
    const authHeaders = await getAuthHeaders();
    let groups: Group[];

    try {
        groups = await Promise.all(
            adminsArray.map(async (groupId) => {
                const { data } = await axios.get(
                    `${API_URL}/group?groupId=${groupId}`,
                    { headers: authHeaders }
                );
                return data as Group;
            })
        );
    } catch (error) {
        console.log(chalk.red('There was an error getting the passcodes'));
        await inquirer.prompt({
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        });
        return;
    }

    groups = groups.slice().filter((group) => group.open === false);

    const table = new Table({
        head: [chalk.white('Name'), chalk.white('Passcode')]
    });

    groups.forEach((group) => {
        table.push([group.displayName, group.passCode?.toUpperCase()]);
    });

    console.log(table.toString());
    await inquirer.prompt({
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
    });
    return;
};

export default adminDashboardViewPasscodes;
