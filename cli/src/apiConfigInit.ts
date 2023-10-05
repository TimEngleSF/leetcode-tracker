import 'dotenv/config';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config.json');

const getApiUrl = async (): Promise<string> => {
  const { apiUrl, apiUrlCheck } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: 'Enter the API URL:',
      validate: (input) =>
        input.startsWith('http://') || input.startsWith('https://')
          ? true
          : 'Please provide a valid URL.',
      filter: (input) => input.trim(),
    },
    {
      type: 'input',
      name: 'apiUrlCheck',
      message: 'Please re-enter the API URL to confirm:',
      filter: (input) => input.trim(),
    },
  ]);

  if (apiUrl !== apiUrlCheck) {
    console.log(chalk.red('URLs do not match. Please try again.'));
    return await getApiUrl();
  }

  return apiUrl;
};

export default getApiUrl;

export const initializeConfig = async () => {
  let config;
  try {
    config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
  } catch (error) {
    config = {};
  }

  if (!config.API_URL) {
    const apiUrl = await getApiUrl();
    config.API_URL = apiUrl;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  }

  return config;
};

export const { API_URL } = await initializeConfig();
