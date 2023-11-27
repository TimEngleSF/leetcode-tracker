#!/usr/bin/env node

import chalk from 'chalk';
import open from 'open';
import mainLoop from './main-loop.js';
import authSelectionPrompt from './Auth/Prompts/auth-selection-prompt.js';
import registerUser from './Auth/register-user-flow.js';
import loginUser from './Auth/login-user-flow.js';
import { getUserJSON, isLoggedIn, printHeader } from './utils.js';
import { API_URL, setLatestVersion } from './config.js';

if (await isLoggedIn()) {
    await setLatestVersion();
    await handleRun();
} else {
    await setLatestVersion();
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
        if (authSelect === 'register') {
            await handleRegistrationFlow();
        } else if (authSelect === 'login') {
            await handleLoginFlow();
            success = true;
        } else if (authSelect === 'reset') {
            await handleResetFlow();
        } else {
            success = true;
            await handleDefaultFlow();
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
}

async function handleLoginFlow() {
    console.log(chalk.green('Logging in...'));
    const success = await loginUser();
    if (success === false) {
        // start over if user was not successful logging in and does not want to attempt to login again
        return await handleNonLoggedInUsers();
    }
    console.clear();
    printHeader();
    await handleRun();
}

async function handleResetFlow() {
    console.log(chalk.green('Opening reset password form in browser...'));
    open(`${API_URL}/reset-page`);
    console.clear();
    printHeader();
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
