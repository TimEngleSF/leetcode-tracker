import axios from 'axios';
import chalk from 'chalk';

import registrationPrompt from './Prompts/registrationPrompt.js';
import { API_URL } from '../apiConfigInit.js';
import { RegistrationPrompt } from '../Types/prompts.js';

const registerToAPI = async (answers: RegistrationPrompt) => {
  const { username, email, firstName, lastInit, password } = answers;
  const payload = {
    username,
    email,
    firstName,
    lastInit,
    password,
  };
  try {
    const { data } = await axios({
      method: 'POST',
      url: `${API_URL}/register`,
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    return data;
  } catch (error: any) {
    return error.response?.data || 'An unexpected error occurred';
  }
};

const registerUser = async (): Promise<void> => {
  const answers = await registrationPrompt();
  const registerPayload = {
    username: answers.username.trim(),
    email: answers.email.trim(),
    firstName: answers.firstName.trim(),
    lastInit: answers.lastInit.trim(),
    password: answers.password,
  };
  const data = await registerToAPI(registerPayload);

  if (data.message) {
    console.log(chalk.redBright(data.message, data.error));
    return await registerUser();
  }
};

export default registerUser;
