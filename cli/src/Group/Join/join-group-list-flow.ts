import {
    groupChoicePrompt,
    noGroupsPrompt,
    openOrPrivatePrompt,
    passCodePrompt,
    tryAgainPrompt
} from './join-prompts.js';
import { Group } from '../../Types/api.js';
import {
    addGroupToJSON,
    continuePrompt,
    fetchGroups,
    joinGroup,
    localGroupsArray
} from '../../utils.js';
import chalk from 'chalk';

const joinGroupListFlow = async () => {
    const areOpenGroup = await openOrPrivatePrompt();

    let groups: Omit<Group, 'passCode'>[];

    try {
        groups = await fetchGroups();
    } catch (error: any) {
        const tryAgain = await tryAgainPrompt(
            `There was an error getting groups: ${error.message}`
        );

        if (tryAgain) {
            await joinGroupListFlow();
        }
        return;
    }

    const usersGroups = await localGroupsArray();
    const groupsListData = groups
        .map((group) => {
            if (usersGroups.includes(group._id)) {
                return undefined;
            }
            if (areOpenGroup === group.open) {
                return { name: group.displayName, value: group._id };
            }
        })
        .filter(
            (choice): choice is { name: string; value: string } =>
                choice !== undefined
        );

    if (groupsListData.length <= 0) {
        await noGroupsPrompt(areOpenGroup);
        return;
    }

    const groupChoice = await groupChoicePrompt(groupsListData);

    if (groupChoice === 'back') {
        await joinGroupListFlow();
        return;
    }

    let [chosenGroupData] = groups.filter((group) => group._id === groupChoice);

    if (areOpenGroup === true) {
        try {
            await joinGroup(chosenGroupData._id);
            await addGroupToJSON(chosenGroupData._id);

            console.log(
                chalk.green(
                    `You have successfully joined  ${chosenGroupData.displayName}`
                )
            );

            await continuePrompt();
        } catch (error) {
            const tryAgain = await tryAgainPrompt(
                `There was an error joining the group`
            );
            if (tryAgain) {
                await joinGroupListFlow();
            }
            return;
        }
    }

    if (areOpenGroup === false) {
        const passCode = await passCodePrompt(chosenGroupData);

        try {
            await joinGroup(chosenGroupData._id, passCode);
            await addGroupToJSON(chosenGroupData._id);

            await continuePrompt();
        } catch (error) {
            const tryAgain = await tryAgainPrompt(
                'There was an error joining the group'
            );

            if (tryAgain) {
                await joinGroupListFlow();
            }
            return;
        }
    }
};

export default joinGroupListFlow;
