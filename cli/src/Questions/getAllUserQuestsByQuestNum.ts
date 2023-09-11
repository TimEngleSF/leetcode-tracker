import axios from 'axios';
import { format } from 'date-fns';
import Table from 'cli-table3';
import chalk from 'chalk';

import getUserLocalData from '../getUserLocalData.js';
import { getAuthHeaders } from '../utils.js';
import writeErrorToFile from '../errors/writeError.js';

interface GeneralInfo {
  questNum: number;
  diff: number;
  username: string;
  userID: string;
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

const getAllUserQuestsByQuestNum = async (questNum: number) => {
  try {
    const user = await getUserLocalData();
    const authHeaders = await getAuthHeaders();

    const response = await axios({
      method: 'GET',
      url: `http://localhost:3000/questions/?userID=${user.LC_ID}&question=${questNum}`,
      headers: { ...authHeaders },
    });
    const data: ApiResponse = response.data;
    const sortedQuestByDate = data.questions.sort(
      (a: Question, b: Question) => b.created - a.created
    );

    const table = new Table({
      head: [chalk.white('Date'), chalk.white('Passed'), chalk.white('Speed')],
      colWidths: [20, 15, 10],
    });

    sortedQuestByDate.forEach((quest: Question) => {
      const date = format(new Date(quest.created), 'MM-dd-yyyy hh:mma');
      const passed = quest.passed ? chalk.green('Passed') : chalk.red('Failed');
      const speed = quest.speed ? quest.speed : 'N/A';
      table.push([date, passed, speed]);
    });
    console.log(
      chalk.greenBright(`Previous attempts for question ${questNum}`)
    );
    console.log(table.toString());
  } catch (error: any) {
    writeErrorToFile(
      error,
      'Error arrised while executing getAllUserQuestsByQuestNum'
    );
    console.error('There was an error getting your previous questions');
  }
};

export default getAllUserQuestsByQuestNum;
