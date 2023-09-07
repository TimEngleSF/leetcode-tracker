import axios from 'axios';
import addQuestionPrompt from '../Auth/Prompts/addQuestionPrompt.js';
import getUserLocalData from '../getUserLocalData.js';
import { getAuthHeaders, printHeader } from '../utils.js';
import mainLoop from '../mainLoop.js';

const addQuestion = async () => {
  try {
    const userInfo = await getUserLocalData();
    const answers = await addQuestionPrompt();
    const authHeaders = await getAuthHeaders();
    console.log(authHeaders);

    const payload = {
      userID: userInfo.LC_ID,
      username: userInfo.LC_USERNAME,
      questNum: answers.questNum,
      diff: answers.diff,
      passed: answers.passed,
      speed: answers.speed || null,
    };
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/questions/add',
      headers: authHeaders,
      data: payload,
    });
  } catch (error) {
    console.error(error);
  }
};

addQuestion();
