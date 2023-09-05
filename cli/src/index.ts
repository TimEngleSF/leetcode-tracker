import 'dotenv/config';
import { Command } from 'commander';

import figlet from 'figlet';
import inquirer from 'inquirer';

import fs from 'fs/promises';

import { checkForEnv } from './utils.js';
import getAuthSelection from './Auth/getAuthSelection.js';
import registerUser from './Auth/registerUser.js';

let LC_USERNAME = process.env.USERNAME;
let ACCESS_TOKEN = process.env.ACCESS_TOKEN;

console.log(figlet.textSync('LeetCode Tracker'));

// checkForEnv();

const authSelect = await getAuthSelection();

if (authSelect === 'register') {
  await registerUser();
}
