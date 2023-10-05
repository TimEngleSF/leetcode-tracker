import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
import figlet from 'figlet';
import axios from 'axios';
import { API_URL } from './apiConfigInit.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserJSON = async () => {
  const data = (
    await fs.readFile(path.join(__dirname, 'user.json'))
  ).toString();

  const userObject = JSON.parse(data);

  return userObject;
};

export const getAuthHeaders = async () => {
  const { LC_TOKEN } = await getUserJSON();
  return { Authorization: `Bearer ${LC_TOKEN}` };
};

export const printHeader = () => {
  console.log(chalk.cyan(figlet.textSync('LeetCode Tracker')));
};

export const clearPrevLine = () => {
  readline.moveCursor(process.stdout, 0, -1);

  readline.clearLine(process.stdout, 0);

  readline.cursorTo(process.stdout, 0);
};

export const logout = async () => {
  const payload = {
    LC_USERNAME: null,
    LC_ID: null,
    LC_TOKEN: null,
    LC_FIRSTNAME: null,
    LC_LASTINIT: null,
  };

  const payloadString = JSON.stringify(payload, null, 2);

  await fs.writeFile(path.join(__dirname, 'user.json'), payloadString);
  return payload;
};

export const getUserData = async (userID: string) => {
  const authHeaders = await getAuthHeaders();
  const { data } = await axios({
    method: 'GET',
    url: `${API_URL}/users/${userID}`,
    headers: authHeaders,
  });
  return data;
};

export const getQuestionData = async (
  questNum: number,
  axiosInstance: any = axios,
  getAuthHeadersFunc: any = getAuthHeaders
) => {
  const authHeaders = await getAuthHeadersFunc();
  const { data } = await axiosInstance({
    method: 'GET',
    url: `${API_URL}/questions/data/${questNum}`,
    headers: authHeaders,
  });
  return data;
};
