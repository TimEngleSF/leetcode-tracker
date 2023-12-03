import inquirer from 'inquirer';
import Group from './Group.js';
import adminDashboardGroupSelectPrompt from './Prompts/admin-dashboard/admin-dashboard-selection.js';
import { continuePrompt } from '../utils.js';
import adminDashboardOptionsPrompt from './Prompts/admin-dashboard/admin-dashboard-options.js';

const adminDashboardFlow = async () => {
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
};

export default adminDashboardFlow;
