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
  created: number;
}

interface ApiResponse {
  general: GeneralInfo;
  questions: Question[];
}

const displayPage = (
  data: any,
  start: number,
  end: number,
  currentPage = 1,
  totalPages: number
) => {
  const table = new Table({
    head: [chalk.white('Date'), chalk.white('Passed'), chalk.white('Speed')],
    colWidths: [20, 15, 10],
  });
  console.log(start, end);
  const slice = data.slice(start, end);
  slice.forEach((quest: any) => {
    const date = format(new Date(quest.created), 'MM-dd-yyyy hh:mma');
    const passed = quest.passed ? chalk.green('Passed') : chalk.red('Failed');
    const speed = quest.speed ? quest.speed : 'N/A';
    table.push([date, passed, speed]);
  });
  console.clear();
  printHeader();
  console.log(`${chalk.magenta('Page: ')} ${currentPage}/${totalPages}`);
  console.log(table.toString());
};

const paginate = async (sortedQuestByDate: any) => {
  const perPage = 5;
  let currentPage = 1;
  let totalPages = Math.ceil(sortedQuestByDate.length / perPage);

  while (true) {
    const start = (currentPage - 1) * perPage;
    const end = currentPage * perPage;
    displayPage(sortedQuestByDate, start, end, currentPage, totalPages);

    let choices = [];
    if (currentPage < totalPages) {
      choices.push({ name: 'Next', value: 'next' });
    }
    if (currentPage > 1) {
      choices.push({ name: 'Previous', value: 'prev' });
    }
    choices.push({ name: 'Exit', value: 'exit' });

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: choices,
      },
    ]);

    if (action === 'next' && currentPage < totalPages) {
      currentPage++;
    } else if (action === 'prev' && currentPage > 1) {
      currentPage--;
    } else if (action === 'exit') {
      break;
    }
  }
};

const getAllUserQuestsByQuestNum = async (questNum: number) => {
  try {
    const user = await getUserJSON();
    const authHeaders = await getAuthHeaders();

    const response = await axios({
      method: 'GET',
      url: `${API_URL}/questions/?userId=${user.LC_ID}&question=${questNum}`,
      headers: { ...authHeaders },
    });
    const data: ApiResponse = response.data;
    const sortedQuestByDate = data.questions.sort(
      (a: Question, b: Question) => b.created - a.created
    );

    console.log(
      chalk.greenBright(`Previous attempts for question ${questNum}`)
    );

    await paginate(sortedQuestByDate);
  } catch (error: any) {
    console.error('There was an error getting your previous questions', error);
  }
};

export default getAllUserQuestsByQuestNum;
