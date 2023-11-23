import inquirer from 'inquirer';
import chalk from 'chalk';

import { getUserJSON, logout, printHeader } from './utils.js';
// import addQuestionToDB from './Questions/addQuestionToDB.js';
import viewPrevQuestPrompt from './Questions/Prompts/viewPrevQuestPrompt.js';
import getAllUserQuestsByQuestNum from './Questions/previous-attempts.js';
import ReviewQuestions from './ReviewQuestions/ReviewQuestions.js';
import Leaderboard from './Leaderboard/Leaderboard.js';
import Group from './Group/Group.js';
import addQuestion from './Questions/add-question-flow.js';

const mainLoop = async () => {
    let isRunning = true;
    let questNum: number | undefined;
    let viewPrevQuest = false;

    loop: while (isRunning) {
        // Section for Breaking loop
        if (viewPrevQuest) {
            await getAllUserQuestsByQuestNum(questNum);
            // const action = await inquirer.prompt({
            //     type: 'confirm',
            //     name: 'continue',
            //     message: 'Do you want to continue?',
            //     default: true
            // });
            // if (action.continue) {
            //     console.clear();
            //     printHeader();
            //     viewPrevQuest = false;
            // } else {
            //     isRunning = false;
            //     break loop;
            // }
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
                // questNum = await addQuestionToDB();
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
                await Leaderboard();
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
