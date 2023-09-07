import 'dotenv/config';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
import figlet from 'figlet';
import getUserLocalData from './getUserLocalData.js';

const { LC_TOKEN } = await getUserLocalData();

export const getAuthHeaders = async () => ({
  Authorization: `Bearer ${LC_TOKEN}`,
});

export const checkForEnv = async () => {
  let envExists;

  try {
    await fs.access(new URL('.env', import.meta.url));
    envExists = true;
  } catch (error) {
    envExists = false;
  }

  if (!envExists) {
    await fs.writeFile(new URL('./.env', import.meta.url), '');
  }
};

export const getUserJSON = async () => {
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const data = (
    await fs.readFile(path.join(__dirname, 'user.json'))
  ).toString();

  const userObject = JSON.parse(data);

  return userObject;
};

export const printHeader = () => {
  console.log(chalk.cyan(figlet.textSync('LeetCode Tracker')));
};

export const clearPrevLine = () => {
  readline.moveCursor(process.stdout, 0, -1);

  readline.clearLine(process.stdout, 0);

  readline.cursorTo(process.stdout, 0);
};
