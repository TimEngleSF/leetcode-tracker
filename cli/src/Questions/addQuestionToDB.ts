import axios from 'axios';
import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import addQuestionPrompt from '../Prompts/addQuestionPrompt.js';
import getUserLocalData from '../getUserLocalData.js';
import { getAuthHeaders } from '../utils.js';
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

    console.log(chalk.green('\nSuccessfuly added your question!\n'));

    return answers.questNum;
  } catch (error) {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    await fs.writeFile(
      path.join(__dirname, '..', 'test.txt'),
      JSON.stringify(error)
    );
    console.log(chalk.red(error));
  }
};

export default addQuestionToDB;
