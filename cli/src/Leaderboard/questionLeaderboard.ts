import axios from 'axios';
import chalk from 'chalk';
import { format } from 'date-fns';

import {
  getAuthHeaders,
  getQuestionData,
  getUserJSON,
  printHeader,
} from '../utils.js';
import {
  createRowData,
  formatRank,
  getDisplayTextForUser,
  initQuestTable,
} from './helperFunc.js';
import { selectQuestionNum } from './Prompts/selectQuestionNum.js';

export const questionLeaderboard: any = async () => {
  try {
    const { LC_ID } = await getUserJSON();
    const questID = await selectQuestionNum();
    const authHeader = await getAuthHeaders();
    const questionData: { questID?: number; title?: string } =
      await getQuestionData(questID);

    const leaderData = await axios({
      method: 'GET',
      url: `http://localhost:3000/leaderboard/${questID}`,
      headers: { ...authHeader },
    });

    // Init table+userDisplay Data, createRowData
    const table = initQuestTable();
    const rowData = await createRowData(leaderData);
    const userDisplayData: { rank?: number; name?: string } = {};

    // Format and push rowData to table
    rowData
      .sort((a, b) => b.passedCount - a.passedCount)
      .forEach((row, i) => {
        console.log(row.userID, LC_ID);
        if (row.userID === LC_ID) {
          userDisplayData.rank = i + 1;
          userDisplayData.name = `${row.firstName} ${row.lastInit}.`;
        }
        const rank = formatRank(i);
        const name = `${row.firstName} ${row.lastInit}.`;
        const passedCount = row.passedCount;
        const minSpeed = row.minSpeed ? `${row.minSpeed}ms` : 'N/A';
        const mostRecent = format(new Date(row.mostRecent), 'MM-dd-yyyy');
        table.push([rank, name, passedCount, minSpeed, mostRecent]);
      });

    const userDisplayText = getDisplayTextForUser(userDisplayData);
    // Print To console
    console.clear();
    printHeader();
    console.log(
      chalk.magenta(`${questionData.questID}. ${questionData.title}\n`)
    );
    console.log(userDisplayText);
    console.log(table.toString());
  } catch (error: any) {
    console.log(error);
  }
};
