import { selectOverallOrGroupPrompt } from './Prompts/select-overall-or-group.js';
import allUsersFlow from './all-users-flow.js';
import groupFlow from './group-flow.js';

const LeaderboardFlow = async ({ errorMessage }: { errorMessage?: string }) => {
    const overallOrGroup = await selectOverallOrGroupPrompt({});

    if (overallOrGroup === 'home') {
        return;
    }

    if (overallOrGroup === 'group') {
        await groupFlow({});
    }

    if (overallOrGroup === 'overall') {
        await allUsersFlow({});
    }
};

export default LeaderboardFlow;
