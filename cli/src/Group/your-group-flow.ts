import inquirer from 'inquirer';
import Group from './group-menu.js';
import yourGroupsPrompt from './Prompts/your-group/your-group-selection.js';
import { continuePrompt } from '../utils.js';

const yourGroupsFlow = async () => {
    const groupSelection = await yourGroupsPrompt();

    if (groupSelection === 'back') {
        await Group();
        return;
    }
};

export default yourGroupsFlow;
