import axios, { AxiosError } from 'axios';

import validateSecQuestPrompt from './Prompts/validation/validateSecQuestPrompt.js';
import inquirer from 'inquirer';
import validateColorPrompt from './Prompts/validation/validateColorPrompt.js';
import chalk from 'chalk';
import validateStreetPrompt from './Prompts/validation/validateStreetPrompt.js';

const sendValidationToAPI = async (
  username: string,
  yob: string,
  answerType: string,
  validationAnswer: string
) => {
  if (answerType === 'color') {
    return await axios({
      method: 'POST',
      url: 'http://localhost:3000/validate',
      data: {
        username,
        yob,
        color: validationAnswer,
      },
    });
  } else {
    return await axios({
      method: 'POST',
      url: 'http://localhost:3000/validate',
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
    console.log(apiResponse.data, apiResponse.status);
  } catch (error: any) {
    const responseData = error.response.data;
    console.log(responseData);
    if (responseData.error === 'username' || responseData.error === 'yob') {
      console.log(chalk.red(responseData.message));
      await resetPass();
    } else if (responseData.error === 'color') {
      // Create a function to do this which takes in the username and yob as params, so it can run again if there is an error

      const { colorErrorSelection } = await inquirer.prompt([
        {
          type: 'list',
          message: responseData.message,
          name: 'colorErrorSelection',
          choices: [
            { name: 'Enter color again', value: 'color' },
            { name: 'Enter the street you grew up on', value: 'street' },
            { name: 'Exit', value: 'exit' },
          ],
        },
      ]);
      console.log(colorErrorSelection);
      if (colorErrorSelection === 'color') {
        // Create a function to do this which takes in the username and yob as params, so it can run again if there is an error
        const color = await validateColorPrompt();
        const apiResponse = await sendValidationToAPI(
          username!,
          yob!,
          'color',
          color
        );
      } else if (colorErrorSelection === 'street') {
        // Create a function to do this which takes in the username and yob as params, so it can run again if there is an error

        const street = await validateStreetPrompt();
        const apiResponse = await sendValidationToAPI(
          username!,
          yob!,
          'street',
          street
        );
      }
    }
  }
};

await resetPass();
