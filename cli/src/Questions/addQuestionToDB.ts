import axios from 'axios';
import readline from 'readline';
import addQuestionPrompt from '../Auth/Prompts/addQuestionPrompt.js';
import getUserLocalData from '../getUserLocalData.js';
import { getAuthHeaders, clearPrevLine } from '../utils.js';
import chalk from 'chalk';

const addQuestionToDB = async () => {
  try {
    const answers = await addQuestionPrompt();
    const userInfo = await getUserLocalData();
    const authHeaders = await getAuthHeaders();

    const payload = {
      userID: userInfo.LC_ID,
      username: userInfo.LC_USERNAME,
      questNum: answers.questNum,
      diff: answers.diff,
      passed: answers.passed,
      speed: answers.speed || null,
    };
    // console.log(chalk.bgWhite('Sending your question...'));
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/questions/add',
      headers: authHeaders,
      data: payload,
    });
    // clearPrevLine();
    // console.log(chalk.green('Successfuly added your question!'));
  } catch (error) {
    console.log(chalk.red(error));
  }
};

export default addQuestionToDB;
