import axios from 'axios';
import { format } from 'date-fns';
import Table from 'cli-table3';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { getAuthHeaders, getUserJSON, printHeader } from '../utils.js';
import { API_URL } from '../config.js';
interface GeneralInfo {
    questNum: number;
    diff: number;
    username: string;
    userId: string;
}

interface Question {
    _id: string;
    passed: boolean;
    speed: number | null;
    created: Date;
}

interface ApiResponse {
    general: GeneralInfo;
    questions: Question[];
}

// Display for user's previous attempts
const displayPage = (
    data: any,
    start: number,
    end: number,
    currentPage = 1,
    totalPages: number
) => {
    // Create a new table to display
    const table = new Table({
        head: [
            chalk.white('Date'),
            chalk.white('Passed'),
            chalk.white('Speed')
        ],
        colWidths: [20, 15, 10]
    });

    // Format each question entry and add to table
    const slice = data.slice(start, end);
    slice.forEach((quest: any) => {
        const date = format(new Date(quest.created), 'MM-dd-yyyy hh:mma');
        const passed = quest.passed
            ? chalk.green('Passed')
            : chalk.red('Failed');
        const speed = quest.speed ? quest.speed : 'N/A';
        table.push([date, passed, speed]);
    });
    // Print the table
    console.clear();
    printHeader();
    console.log(`${chalk.magenta('Page: ')} ${currentPage}/${totalPages}`);
    console.log(table.toString());
};

const paginate = async (sortedQuestByDate: any) => {
    const perPage = 5;
    let currentPage = 1;
    let totalPages = Math.ceil(sortedQuestByDate.length / perPage);
    //  Start a loop to keep pages open
    while (true) {
        const start = (currentPage - 1) * perPage;
        const end = currentPage * perPage;
        // Execute display page to display current page
        displayPage(sortedQuestByDate, start, end, currentPage, totalPages);
        // Generate prompt to move through pages
        let choices = [];
        if (currentPage < totalPages) {
            choices.push({ name: 'Next', value: 'next' });
        }
        if (currentPage > 1) {
            choices.push({ name: 'Previous', value: 'prev' });
        }
        choices.push({ name: 'Home', value: 'exit' });
        // Prompt user to move through pages
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to do?',
                choices: choices
            }
        ]);
        // Execute user's prompt decision
        if (action === 'next' && currentPage < totalPages) {
            currentPage++;
        } else if (action === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (action === 'exit') {
            break;
        }
    }
};

const getAllUserQuestsByQuestNum = async (questNum?: number) => {
    try {
        // Get user info
        const user = await getUserJSON();
        const authHeaders = await getAuthHeaders();
        // fetch user's previous attempts at question
        const response = await axios({
            method: 'GET',
            url: `${API_URL}/questions/?userId=${user.LC_ID}&question=${questNum}`,
            headers: { ...authHeaders }
        });
        // Sort entries
        const data: ApiResponse = response.data;
        const sortedQuestByDate = data.questions.sort(
            (a: Question, b: Question) => {
                const dateA = new Date(a.created);
                const dateB = new Date(b.created);
                return dateB.getTime() - dateA.getTime();
            }
        );
        // Display pages
        console.log(
            chalk.greenBright(`Previous attempts for question ${questNum}`)
        );

        await paginate(sortedQuestByDate);
    } catch (error: any) {
        console.error(
            'There was an error getting your previous questions',
            error
        );
    }
};

export default getAllUserQuestsByQuestNum;
