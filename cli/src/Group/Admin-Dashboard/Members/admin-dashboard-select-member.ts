import inquirer from 'inquirer';
import chalk from 'chalk';
import { MembersInfo, getGroupMembers, printHeader } from '../../../utils.js';
import dateFns, { parseISO } from 'date-fns';

const adminDashboardMemberSelectPrompt = async (
    groupId: string
): Promise<
    | {
          _id: string;
          name: string;
      }
    | 'back'
> => {
    console.clear();
    printHeader();
    let membersInfo = await getGroupMembers(groupId);

    const { sortOption } = await inquirer.prompt({
        type: 'list',
        name: 'sortOption',
        message: 'How would you like to sort members?',
        choices: [
            { name: 'Alphabetically by last initial', value: 'lastInit' },
            { name: 'Most recently active', value: 'recent' },
            { name: 'Least recently active', value: 'notRecent' },
            { name: 'Go Back', value: 'back' }
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
                    new Date(b.lastActivity).getTime() -
                    new Date(a.lastActivity).getTime()
            );
    } else if (sortOption === 'notRecent') {
        membersInfo = membersInfo
            .slice()
            .sort(
                (a: MembersInfo, b: MembersInfo) =>
                    new Date(a.lastActivity).getTime() -
                    new Date(b.lastActivity).getTime()
            );
    }

    if (sortOption !== 'back') {
        console.clear();
        printHeader();
        const choices = membersInfo.map((member, i) => {
            const formatedName = `Name: ${member.firstName} ${
                member.lastInit
            }. Last Active: ${dateFns.format(
                parseISO(member.lastActivity),
                'MM-dd-yy'
            )}`;
            let name;
            if (i === 0 || i % 2 === 0) {
                name = chalk.bgGray(formatedName);
            } else {
                name = formatedName;
            }
            return {
                name,
                value: {
                    _id: member._id,
                    name: `${member.firstName} ${member.lastInit}.`
                }
            };
        });

        const { memberChoice } = await inquirer.prompt({
            type: 'list',
            name: 'memberChoice',
            message: 'Choose a member',
            choices: [...choices, { name: 'Go back', value: 'back' }]
        });

        if (memberChoice === 'back') {
            const memberChoice = await adminDashboardMemberSelectPrompt(
                groupId
            );
            return memberChoice;
        }

        return memberChoice;
    }

    return sortOption;
};

export default adminDashboardMemberSelectPrompt;
