import { selectGroupOption } from './Prompts/select-group-option.js';
import createGroup from './create-group.js';

const Group = async () => {
    const answer = await selectGroupOption();
    if (answer === 'join') {
        // await joinGroup();
    } else {
        await createGroup({});
    }
};

export default Group;
