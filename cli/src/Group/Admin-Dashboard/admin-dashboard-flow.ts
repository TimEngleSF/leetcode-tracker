import inquirer from 'inquirer';
import Group from '../group-menu.js';
import adminDashboardGroupSelectPrompt from './Prompts/admin-dashboard-selection.js';
import { continuePrompt, printHeader } from '../../utils.js';
import adminDashboardOptionsPrompt from './Prompts/admin-dashboard-options.js';
import adminDashboardMembersPrompt from './Prompts/admin-dashboard-members.js';
import adminDashboardUpdateFeaturedQuestPrompt from './Prompts/admin-dashboard-update-featured-question.js';
import adminDashboardViewPasscodes from '../view-passcodes.js';

const adminDashboardFlow = async () => {
    console.clear();
    printHeader();
    const groupSelection = await adminDashboardGroupSelectPrompt();

    if (groupSelection === 'back') {
        await Group();
        return;
    }

    const optionSelection = await adminDashboardOptionsPrompt();

    if (optionSelection === 'back') {
        await adminDashboardFlow();
        return;
    }

    if (optionSelection === 'memberAction') {
        await adminDashboardMembersPrompt(groupSelection);
    }

    if (optionSelection === 'updateFeaturedQuestion') {
        await adminDashboardUpdateFeaturedQuestPrompt(groupSelection);
    }
};

export default adminDashboardFlow;
