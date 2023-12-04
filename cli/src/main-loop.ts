import inquirer from 'inquirer';
import chalk from 'chalk';

import { getUserJSON, logout, printHeader } from './utils.js';
import viewPrevQuestPrompt from './AddQuestions/Prompts/viewPrevQuestPrompt.js';
import getAllUserQuestsByQuestNum from './AddQuestions/previous-attempts.js';
import ReviewQuestions from './ReviewQuestions/ReviewQuestions.js';
import Group from './Group/Group.js';
import addQuestion from './AddQuestions/add-question-flow.js';
import LeaderboardFlow from './Leaderboard/leaderboard-flow.js';
import featuredQuestionFlow from './FeaturedQuestions/featured-question-flow.js';

const mainLoop = async () => {
    let isRunning = true;
    let questNum: number | undefined;
    let viewPrevQuest = false;

    loop: while (isRunning) {
        // Section for Breaking loop
        if (viewPrevQuest) {
            await getAllUserQuestsByQuestNum(questNum);
            console.clear();
            printHeader();
            viewPrevQuest = false;
        }

        const userObject = await getUserJSON();

        // Main Section
        const action = await inquirer.prompt([
            {
                type: 'list',
                name: 'nextAction',
                message: chalk.greenBright('What would you like to do?'),
                choices: [
                    { name: 'Add Question Result', value: 'addQuestion' },
                    { name: 'Leaderboard', value: 'leaderboard' },
                    { name: 'Featured Questions', value: 'featured' },
                    { name: 'Review Questions', value: 'review' },
                    { name: 'Groups', value: 'groups' },
                    { name: 'Logout', value: 'logout' },
                    { name: 'Exit', value: 'exit' }
                ]
            }
        ]);
        console.clear();
        printHeader();

        switch (action.nextAction) {
            case 'addQuestion':
                console.log(chalk.green('Adding question...'));
                const result = await addQuestion({});
                questNum = result.questNum;
                if (result.continue) {
                    console.log(chalk.green('Question added!'));
                    viewPrevQuest = await viewPrevQuestPrompt();
                }
                console.clear();
                printHeader();
                break;
            case 'leaderboard':
                await LeaderboardFlow({});
                console.clear();
                printHeader();
                break;
            case 'featured':
                await featuredQuestionFlow();
                console.clear();
                printHeader();
                break;
            case 'review':
                console.clear();
                printHeader();
                await ReviewQuestions();
                console.clear();
                printHeader();
                break;
            case 'groups':
                console.clear();
                printHeader();
                await Group();
                console.clear();
                printHeader();
                break;
            case 'logout':
                console.clear();
                await logout();
                console.log(chalk.green('Come back soon!'));
            case 'exit':
                console.log(chalk.red('Exiting LeetCode Tracker'));
                isRunning = false;
                break;
        }
    }
};

export default mainLoop;
