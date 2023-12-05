import inquirer from 'inquirer';
import Group from '../group-menu.js';
import adminDashboardGroupSelectPrompt from './Prompts/admin-dashboard-selection.js';
import { continuePrompt, printHeader } from '../../utils.js';
import adminDashboardOptionsPrompt from './Prompts/admin-dashboard-options.js';
import adminDashboardUpdateFeaturedQuestPrompt from './Prompts/admin-dashboard-update-featured-question.js';
import adminDashboardViewPasscodes from '../view-passcodes.js';
import adminDashboardMemberFlow from './Members/admin-dashboard-members-flow.js';

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
        await Group();
        return;
    }

    if (optionSelection === 'memberAction') {
        await adminDashboardMemberFlow(groupSelection);
    }

    if (optionSelection === 'updateFeaturedQuestion') {
        await adminDashboardUpdateFeaturedQuestPrompt(groupSelection);
    }
};

export default adminDashboardFlow;
