import inquirer from 'inquirer';
import chalk from 'chalk';

import validateColorPrompt from '../Prompts/validation/validateColorPrompt.js';
import validateStreetPrompt from '../Prompts/validation/validateStreetPrompt.js';
import { sendValidationToAPI } from './resetPass.js';
import { printHeader } from '../../utils.js';
import handleResetPass from './handleResetPass.js';

const handleColorError = async (
  username: string,
  yob: string,
  errorData: { error: string; message: string }
) => {
  console.clear();
  printHeader();
  let apiResponse;
  try {
    const { colorErrorSelection } = await inquirer.prompt([
      {
        type: 'list',
        message: `An error occurred: ${chalk.red(
          errorData.message
        )},\n  What would you like to do?`,
        name: 'colorErrorSelection',
        choices: [
          { name: 'Enter your favorite color', value: 'color' },
          { name: 'Enter the street you grew up on', value: 'street' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    if (colorErrorSelection === 'color') {
      const color = await validateColorPrompt();
      apiResponse = await sendValidationToAPI(username, yob, 'color', color);
      await handleResetPass(username, apiResponse.data.token);
    } else if (colorErrorSelection === 'street') {
      const street = await validateStreetPrompt();
      apiResponse = await sendValidationToAPI(username, yob, 'street', street);
      await handleResetPass(username, apiResponse.data.token);
    }
  } catch (error: any) {
    await handleColorError(username, yob, error.response.data);
  }
};

export default handleColorError;
