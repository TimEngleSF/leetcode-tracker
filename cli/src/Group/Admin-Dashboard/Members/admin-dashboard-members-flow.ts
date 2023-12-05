import inquirer from 'inquirer';
import chalk from 'chalk';
import adminDashboardMemberSelectPrompt from './admin-dashboard-select-member.js';
import { continuePrompt, getAuthHeaders, printHeader } from '../../../utils.js';
import {
    adminDashboardConfirmMemberAction,
    adminDashboardMemberAction
} from './members-flow-prompts.js';
import axios from 'axios';
import { API_URL } from '../../../config.js';

const adminDashboardMemberFlow = async (groupId: string) => {
    const member = await adminDashboardMemberSelectPrompt(groupId);

    console.clear();
    printHeader();

    if (member === 'back') {
        return;
    }

    const action = await adminDashboardMemberAction();

    console.clear();
    printHeader();

    if (action === 'back') {
        await adminDashboardMemberFlow(groupId);
        return;
    }

    if (action === 'admin') {
        const isConfirmed = await adminDashboardConfirmMemberAction(
            'admin',
            member.name
        );
        if (isConfirmed) {
            try {
                await axios({
                    method: 'PUT',
                    url: `${API_URL}/group/add-admin`,
                    headers: await getAuthHeaders(),
                    data: { groupId, userId: member._id }
                });
                console.clear();
                printHeader();
                console.log(
                    chalk.bold.green(
                        `Successfully added ${member.name} as an admin.`
                    )
                );
                await continuePrompt();
                return;
            } catch (error: any) {
                const errorMessage = error.response.data.message;
                console.log(
                    chalk.bold.red(
                        `There was an error setting the user as an admin: ${errorMessage}`
                    )
                );
                await continuePrompt();
                return;
            }
        }
        await adminDashboardMemberFlow(groupId);
        return;
    }

    if (action === 'remove') {
        const isConfirmed = await adminDashboardConfirmMemberAction(
            'remove',
            member.name
        );
        if (isConfirmed) {
            try {
                await axios({
                    method: 'DELETE',
                    url: `${API_URL}/group/remove-member`,
                    headers: await getAuthHeaders(),
                    data: { groupId, userId: member._id }
                });
                console.clear();
                printHeader();
                console.log(
                    chalk.bold.green(
                        `Successfully removed ${member.name} from group.`
                    )
                );
                await continuePrompt();
                return;
            } catch (error: any) {
                const errorMessage = error.response.data.message;
                console.log(
                    chalk.bold.red(
                        `There was an error setting the user as an admin: ${errorMessage}`
                    )
                );
                await continuePrompt();
                return;
            }
        }
        await adminDashboardMemberFlow(groupId);
        return;
    }
};

export default adminDashboardMemberFlow;
