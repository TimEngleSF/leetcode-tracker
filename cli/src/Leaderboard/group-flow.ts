import chalk from 'chalk';
import selectGroupPrompt from './Prompts/group-selection.js';
import selectLeaderboardTypePrompt from './Prompts/select-leaderboard-type.js';
import LeaderboardFlow from './leaderboard-flow.js';
import { printHeader } from '../utils.js';
import { generalLeaderboard } from './general-leaderboard/display-general-leaderboard.js';
import inquirer from 'inquirer';
import { questionLeaderboard } from './question-leaderboard/display-question-leaderboard.js';

const groupFlow = async ({ errorMessage }: { errorMessage?: string }) => {
    // Display an error message if one exists
    if (errorMessage) {
        console.log(chalk.red(errorMessage));
    }
    // Prompt user for which group they would like to create a leaderboard for
    const groupSelection = await selectGroupPrompt({});
    // If selection is back then execute groupFlow again
    if (groupSelection === 'back') {
        console.clear();
        printHeader();
        await LeaderboardFlow({});
        return;
    }
    // Prompt user for which type of leaderboard they want
    const leaderboardType = await selectLeaderboardTypePrompt({});
    // If selection is back then execute groupFlow again
    if (leaderboardType === 'back') {
        await groupFlow({});
        return;
    }
    // Display overall leaderboard
    if (leaderboardType === 'overall') {
        const leaderboardDisplayed = await generalLeaderboard({
            groupId: groupSelection
        });
        leaderboardDisplayed &&
            (await inquirer.prompt({
                type: 'input',
                name: 'continue',
                message: 'Press Enter to continue...'
            }));
        return;
    }
    // Executes prompts for question number and displays leaderboard
    if (leaderboardType === 'question') {
        const leaderboardDisplayed = await questionLeaderboard({
            groupId: groupSelection
        });
        leaderboardDisplayed &&
            (await inquirer.prompt({
                type: 'input',
                name: 'continue',
                message: 'Press Enter to continue...'
            }));
        return;
    }
};

export default groupFlow;
