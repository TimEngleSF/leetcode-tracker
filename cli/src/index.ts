import 'dotenv/config';
import { Command } from 'commander';

import figlet from 'figlet';
import inquirer from 'inquirer';

import fs from 'fs/promises';

import getAuthSelection from './Auth/getAuthSelection.js';
import registerUser from './Auth/registerUser.js';

const LC_USERNAME = process.env.LC_USERNAME;
const ACCESS_TOKEN = process.env.LC_TOKEN;

console.log(figlet.textSync('LeetCode Tracker'));
console.log(LC_USERNAME, ACCESS_TOKEN);
// checkForEnv();

const authSelect = await getAuthSelection();

if (authSelect === 'register') {
  await registerUser();
}
