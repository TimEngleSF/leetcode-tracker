#!/usr/bin/env node

import chalk from 'chalk';

import mainLoop from './mainLoop.js';
import authSelectionPrompt from './Auth/Prompts/authSelectionPrompt.js';
import registerUser from './Auth/registerUser.js';
import loginUser from './Auth/loginUser.js';
import { getUserJSON, isLoggedIn, printHeader } from './utils.js';

if (await isLoggedIn()) {
  await handleRun();
} else {
  await handleNonLoggedInUsers();
}

async function handleRun() {
  console.clear();
  printHeader();
  const userObject = await getUserJSON();
  console.log(
    chalk.green(
      `Welcome ${userObject.LC_FIRSTNAME} ${userObject.LC_LASTINIT}.\n`
    )
  );
  await mainLoop();
}

async function handleNonLoggedInUsers() {
  console.clear();
  printHeader();

  let success = false;
  while (!success) {
    const authSelect = await authSelectionPrompt();
    switch (authSelect) {
      case 'register':
        await handleRegistrationFlow();
        break;
      case 'login':
        await handleLoginFlow();
        success = true;
        break;
      case 'reset':
        // await handleResetFlow();
        break;
      default:
        await handleDefaultFlow();
        success = true;
        break;
    }
  }
}

async function handleRegistrationFlow() {
  console.log(chalk.green('Registering user...'));
  await registerUser();
  console.clear();
  printHeader();
  console.log(
    chalk.bgGreen('A verification link has been sent to your email.')
  );
  await authSelectionPrompt();
}

async function handleLoginFlow() {
  console.log(chalk.green('Logging in...'));
  await loginUser();
  console.clear();
  printHeader();
  await handleRun();
}

async function handleDefaultFlow() {
  const userObject = await getUserJSON();
  console.clear();
  printHeader();
  console.log(
    chalk.green(
      `Welcome ${userObject.LC_FIRSTNAME} ${userObject.LC_LASTINIT}\n`
    )
  );
  await mainLoop();
}
