import axios from 'axios';
import chalk from 'chalk';

import validateSecQuestPrompt from '../Prompts/validation/validateSecQuestPrompt.js';
import validateColorPrompt from '../Prompts/validation/validateColorPrompt.js';
import handleColorError from './handleColorError.js';
import handleResetPass from './handleResetPass.js';
import { API_URL } from '../../apiConfigInit.js';

export const sendValidationToAPI = async (
  username: string,
  yob: string,
  answerType: string,
  validationAnswer: string
) => {
  if (answerType === 'color') {
    return await axios({
      method: 'POST',
      url: `${API_URL}/validate`,
      data: {
        username,
        yob,
        color: validationAnswer,
      },
    });
  } else {
    return await axios({
      method: 'POST',
      url: `${API_URL}/validate`,
      data: {
        username,
        yob,
        street: validationAnswer,
      },
    });
  }
};
const resetPass = async () => {
  let username: string;
  let yob: string;
  try {
    ({ username, yob } = await validateSecQuestPrompt());
    const color = await validateColorPrompt();
    const apiResponse = await sendValidationToAPI(
      username,
      yob,
      'color',
      color
    );
    if (apiResponse.status === 201) {
      await handleResetPass(username, apiResponse.data.token);
    }
  } catch (error: any) {
    const responseData = error.response.data;
    if (responseData.error === 'username' || responseData.error === 'yob') {
      console.log(chalk.red(responseData.message));
      await resetPass();
    } else if (responseData.error === 'color') {
      await handleColorError(username!, yob!, responseData);
    }
  }
};

export default resetPass;
