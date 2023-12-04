import inquirer from 'inquirer';
import chalk from 'chalk';
import { MembersInfo, getGroupMembers } from '../../../utils.js';
import dateFns, { parseISO } from 'date-fns';
import adminDashboardGroupSelectPrompt from './admin-dashboard-selection.js';

const adminDashboardMembersPrompt = async (groupId: string) => {
    let membersInfo = await getGroupMembers(groupId);

    const { sortOption } = await inquirer.prompt({
        type: 'list',
        name: 'sortOption',
        message: 'How would you like to sort members?',
        choices: [
            { name: 'Alphabetically by last initial', value: 'lastInit' },
            { name: 'Most recently active', value: 'recent' },
            { name: 'Least recently active', value: 'notRecent' },
            { name: 'Go back', value: 'back' }
        ]
    });

    if (sortOption === 'lastInit') {
        membersInfo = membersInfo
            .slice()
            .sort(
                (a: MembersInfo, b: MembersInfo) =>
                    a.lastInit.charCodeAt(0) - b.lastInit.charCodeAt(0)
            );
    } else if (sortOption === 'recent') {
        membersInfo = membersInfo
            .slice()
            .sort(
                (a: MembersInfo, b: MembersInfo) =>
                    new Date(a.lastActivity).getTime() -
                    new Date(b.lastActivity).getTime()
            );
    } else if (sortOption === 'notRecent') {
        membersInfo = membersInfo
            .slice()
            .sort(
                (a: MembersInfo, b: MembersInfo) =>
                    new Date(b.lastActivity).getTime() -
                    new Date(a.lastActivity).getTime()
            );
    } else {
        await adminDashboardGroupSelectPrompt();
        return;
    }

    const choices = membersInfo.map((member, i) => {
        const formatedName = `${member.firstName} ${
            member.lastInit
        }. ${dateFns.format(parseISO(member.lastActivity), 'MM-dd-yy')}`;
        let name;
        if (i === 0 || i % 2 === 0) {
            name = chalk.bgGray(formatedName);
        } else {
            name = formatedName;
        }
        return { name, value: member._id };
    });

    const { memberChoice } = await inquirer.prompt({
        type: 'list',
        name: 'memberChoice',
        message: 'Choose a member',
        choices: [...choices, { name: 'Go back', value: 'back' }]
    });

    if (memberChoice === 'back') {
        await adminDashboardMembersPrompt(groupId);
        return;
    }

    return memberChoice;
};

export default adminDashboardMembersPrompt;
