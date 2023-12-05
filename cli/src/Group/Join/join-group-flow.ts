import inquirer from 'inquirer';
import chalk from 'chalk';

import { continuePrompt, printHeader } from '../../utils.js';
import { findOptionSelectionPrompt } from './join-prompts.js';
import joinGroupListFlow from './join-group-list-flow.js';

export const joinGroupFlow = async () => {
    console.clear();
    printHeader();

    const findOption = await findOptionSelectionPrompt();

    if (findOption === 'back') {
        return;
    }

    if (findOption === 'list') {
        await joinGroupListFlow();
        await joinGroupFlow();
        return;
    }

    if (findOption === 'search') {
        console.log(chalk.red('Coming soon...'));
        await continuePrompt();
        await joinGroupFlow();
        return;
    }
};

export default joinGroupFlow;
