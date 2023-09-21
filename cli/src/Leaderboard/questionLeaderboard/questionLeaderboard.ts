import axios from 'axios';
import chalk from 'chalk';

import { getAuthHeaders, getQuestionData, printHeader } from '../../utils.js';
import { selectQuestionNum } from '../Prompts/selectQuestionNumPrompt.js';
import { createQuestLBDisplay } from './helpers/createQuestLBDisplay.js';
import { sortLeaderboardData } from './helpers/utils.js';
import writeErrorToFile from '../../errors/writeError.js';

export const questionLeaderboard: any = async () => {
  try {
    const { questID, sortingSelection } = await selectQuestionNum();
    const authHeader = await getAuthHeaders();
    const questionData: { questID?: number; title?: string } =
      await getQuestionData(questID);

    const { data } = await axios({
      method: 'GET',
      url: `http://localhost:3000/leaderboard/${questID}`,
      headers: { ...authHeader },
    });

    const top10Data = data.slice(0, 10);
    const sortedData = sortLeaderboardData(top10Data, sortingSelection);
    const { table, userDisplayText } = await createQuestLBDisplay(sortedData);

    // Print To console
    console.clear();
    printHeader();
    console.log(
      chalk.magenta(`${questionData.questID}. ${questionData.title}\n`)
    );
    if (!userDisplayText.includes('undefined')) {
      console.log(userDisplayText);
    }
    console.log(table.toString());
  } catch (error: any) {
    try {
      await writeErrorToFile(
        error,
        'Error occured when executing Leaderboard/questionLeaderboard/questionLeaderboard'
      );
      console.log(error);
    } catch (error) {
      console.log(error);
    }
  }
};
