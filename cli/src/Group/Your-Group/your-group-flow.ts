import axios from 'axios';
import chalk from 'chalk';
import Table from 'cli-table3';
import dateFns, { parseISO } from 'date-fns';

import {
    continuePrompt,
    getAuthHeaders,
    getGroupMembers,
    getUserJSON,
    printHeader,
    updateAdminOrGroupArrayJSON
} from '../../utils.js';
import {
    yourGroupConfirmLeavePrompt,
    yourGroupOptionsPrompt,
    yourGroupsSelectionPrompt
} from './your-group-prompts.js';
import { API_URL } from '../../config.js';

const yourGroupFlow = async () => {
    console.clear();
    printHeader();
    console.log(chalk.bold.green('Your Groups'));
    const groupInfo = await yourGroupsSelectionPrompt();

    if (groupInfo === 'back') {
        return;
    }

    console.clear();
    printHeader();
    console.log(chalk.magenta(`Group: ${groupInfo.groupName}\n`));
    const option = await yourGroupOptionsPrompt(groupInfo);

    console.clear();
    printHeader();
    if (option === 'back') {
        await yourGroupFlow();
    }

    if (option === 'leaveGroup') {
        const leaveGroup = await yourGroupConfirmLeavePrompt(groupInfo);

        if (leaveGroup === 'LEAVE') {
            try {
                const authHeaders = await getAuthHeaders();
                await axios({
                    method: 'DELETE',
                    url: `${API_URL}/group/leave-group`,
                    headers: authHeaders,
                    data: { groupId: groupInfo.groupId }
                });

                const userInfo = await getUserJSON();
                const { data } = await axios.get(
                    `${API_URL}/users/${userInfo.LC_ID}`,
                    { headers: authHeaders }
                );

                await updateAdminOrGroupArrayJSON({
                    arrayName: 'admin',
                    data: data.admins
                });
                await updateAdminOrGroupArrayJSON({
                    arrayName: 'group',
                    data: data.groups
                });

                console.log(
                    chalk.green(
                        `You have successfully left ${groupInfo.groupName}`
                    )
                );

                await continuePrompt();

                await yourGroupFlow();
            } catch (error: any) {
                const errorMessage = error.response.data.message;
                console.log(
                    chalk.red(
                        `There was an error leaving the group: ${errorMessage}`
                    )
                );
                await continuePrompt();
                await yourGroupFlow();
            }
        }
    }

    if (option === 'viewMembers') {
        console.clear();
        printHeader();
        let membersInfo = await getGroupMembers(groupInfo.groupId);
        const membersFormattedForTable = membersInfo
            .map((member) => {
                const lastActivity = `${dateFns.format(
                    parseISO(member.lastActivity),
                    'MM-dd-yy'
                )}`;
                return {
                    name: `${member.firstName} ${member.lastInit}.`,
                    lastActivity
                };
            })
            .sort(
                (a, b) =>
                    new Date(b.lastActivity).getTime() -
                    new Date(a.lastActivity).getTime()
            );

        const memberTable = new Table({
            head: [chalk.white('Member'), chalk.white('Last Active')],
            colWidths: [15, 15]
        });

        membersFormattedForTable.forEach((member) => {
            memberTable.push([member.name, member.lastActivity]);
        });

        console.log(memberTable.toString());
        await continuePrompt();
    }
};

export default yourGroupFlow;
