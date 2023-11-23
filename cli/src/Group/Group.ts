import selectJoinOption from './Prompts/join/select-join-option.js';
import { selectGroupOption } from './Prompts/select-group-option.js';
import createGroup from './create-group.js';

const Group = async () => {
    const answer = await selectGroupOption();
    if (answer === 'join') {
        await selectJoinOption({});
    } else if (answer === 'create') {
        await createGroup({});
    } else {
        return;
    }
};

export default Group;
