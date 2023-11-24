import chalk from 'chalk';
import inquirer from 'inquirer';
import selectLeaderboardTypePrompt from './Prompts/select-leaderboard-type.js';
import { generalLeaderboard } from './general-leaderboard/display-general-leaderboard.js';
import { questionLeaderboard } from './question-leaderboard/display-question-leaderboard.js';

const allUsersFlow = async ({ errorMessage }: { errorMessage?: string }) => {
    // Display an error message if one exists
    if (errorMessage) {
        console.log(chalk.red(errorMessage));
    }

    // Prompt user for which type of leaderboard they want
    const leaderboardType = await selectLeaderboardTypePrompt({});
    // If selection is back then execute groupFlow again
    if (leaderboardType === 'back') {
        await allUsersFlow({});
        return;
    }

    if (leaderboardType === 'overall') {
        await generalLeaderboard({});
        await inquirer.prompt({
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        });
        return;
    }

    if (leaderboardType === 'question') {
        await questionLeaderboard({});
        await inquirer.prompt({
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue...'
        });
        return;
    }
};
export default allUsersFlow;
