import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import chalk from 'chalk';

import addQuestionPrompt from './Prompts/addQuestionPrompt.js';
import { getAuthHeaders, getUserJSON } from '../utils.js';
import { API_URL } from '../config.js';

const addQuestionToDB = async (
  questPrompt = addQuestionPrompt,
  userJson = getUserJSON,
  getHeaders = getAuthHeaders,
  axiosInstance = axios,
  testing = false
) => {
  try {
    const answers = await questPrompt();
    const userInfo = await userJson();
    const authHeaders = await getHeaders();
    if (!answers) {
      throw new Error('There was an error with your inputs');
    }
    const payload = {
      userId: userInfo.LC_ID,
      username: userInfo.LC_USERNAME,
      questNum: answers.questNum,
      passed: answers.passed,
      speed: answers.speed || null,
    };

    const { data } = await axiosInstance({
      method: 'POST',
      url: `${API_URL}/questions/add`,
      headers: authHeaders,
      data: payload,
    });

    if (!testing) {
      console.log(chalk.green('\nSuccessfuly added your question!\n'));
    }

    return answers.questNum;
  } catch (error) {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    await fs.writeFile(
      path.join(__dirname, '..', 'test.txt'),
      JSON.stringify(error)
    );
    if (!testing) {
      console.log(chalk.red(`${error}`));
    }
  }
};

export default addQuestionToDB;
