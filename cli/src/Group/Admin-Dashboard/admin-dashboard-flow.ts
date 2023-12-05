import inquirer from 'inquirer';
import Group from '../group-menu.js';
import adminDashboardGroupSelectPrompt from './Prompts/admin-dashboard-selection.js';
import { continuePrompt, printHeader } from '../../utils.js';
import adminDashboardOptionsPrompt from './Prompts/admin-dashboard-options.js';
import adminDashboardUpdateFeaturedQuestPrompt from './Prompts/admin-dashboard-update-featured-question.js';
import adminDashboardMemberFlow from './Members/admin-dashboard-members-flow.js';
import adminDashboardViewPassCode from './Prompts/admin-dashboard-view-passcode.js';
import adminDashboardDeleteGroupPrompt from './Prompts/admin-dashboard-delete-group.js';
import adminDashboardResetPasscodePrompt from './Prompts/admin-dashboard-reset-passcode.js';
import chalk from 'chalk';

const adminDashboardFlow = async () => {
    console.clear();
    printHeader();
    console.log(chalk.bold.green('Admin Dashboard'));
    const groupSelection = await adminDashboardGroupSelectPrompt();

    if (groupSelection === 'back') {
        await Group();
        return;
    }

    const optionSelection = await adminDashboardOptionsPrompt();

    if (optionSelection === 'back') {
        return;
    }

    if (optionSelection === 'memberAction') {
        await adminDashboardMemberFlow(groupSelection);
        await adminDashboardFlow();
    }

    if (optionSelection === 'updateFeaturedQuestion') {
        await adminDashboardUpdateFeaturedQuestPrompt(groupSelection);
        await adminDashboardFlow();
    }

    if (optionSelection === 'viewPasscode') {
        await adminDashboardViewPassCode(groupSelection);
        await adminDashboardFlow();
    }

    if (optionSelection === 'resetPasscode') {
        await adminDashboardResetPasscodePrompt(groupSelection);
        await adminDashboardFlow();
    }

    if (optionSelection === 'deleteGroup') {
        await adminDashboardDeleteGroupPrompt(groupSelection);
        await adminDashboardFlow();
    }
};

export default adminDashboardFlow;
