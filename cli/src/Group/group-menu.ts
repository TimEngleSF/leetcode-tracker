import { selectGroupOption } from './Prompts/main-selection.js';
import adminDashboardFlow from './Admin-Dashboard/admin-dashboard-flow.js';
import createGroupFlow from './Create/create-group-flow.js';
import yourGroupFlow from './Your-Group/your-group-flow.js';
import joinGroupFlow from './Join/join-group-flow.js';

const Group = async () => {
    const answer = await selectGroupOption();
    if (answer === 'groups') {
        await yourGroupFlow();
        await Group();
    } else if (answer === 'adminDashboard') {
        await adminDashboardFlow();
        await Group();
    } else if (answer === 'join') {
        await joinGroupFlow();
        await Group();
    } else if (answer === 'create') {
        await createGroupFlow();
        await Group();
    } else {
        return;
    }
};

export default Group;
