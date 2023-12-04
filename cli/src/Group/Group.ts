import selectJoinOption from './Prompts/join/select-join-option.js';
import { selectGroupOption } from './Prompts/main-selection.js';
import viewPassCodesFlow from './view-passcodes.js';
import adminDashboardFlow from './admin-dashboard-flow.js';
import createGroup from './create-group.js';
import yourGroupsFlow from './your-group-flow.js';

const Group = async () => {
    const answer = await selectGroupOption();
    if (answer === 'groups') {
        await yourGroupsFlow();
    } else if (answer === 'adminDashboard') {
        await adminDashboardFlow();
    } else if (answer === 'join') {
        await selectJoinOption({});
    } else if (answer === 'create') {
        await createGroup({});
    } else if (answer === 'passCodes') {
        await viewPassCodesFlow();
    } else {
        return;
    }
};

export default Group;
