import axios, { AxiosError } from 'axios';
import resetPassPrompt from '../Prompts/resetPassPrompt.js';
import chalk from 'chalk';
import { API_URL } from '../../apiConfigInit.js';

const handleResetPass = async (username: string, token: string) => {
  try {
    const newPass = await resetPassPrompt();
    const payload = {
      username,
      password: newPass,
      token,
    };
    const apiResponse = await axios({
      method: 'PUT',
      url: `${API_URL}/reset`,
      data: payload,
    });
    console.log(chalk.green(apiResponse.data));
  } catch (error: any) {
    const responseData = error.response.data.error;
    console.log(chalk.red(responseData));
  }
};
export default handleResetPass;
