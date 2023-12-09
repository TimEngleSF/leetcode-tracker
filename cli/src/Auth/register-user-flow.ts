import axios from 'axios';
import chalk from 'chalk';

import registrationPrompt from './Prompts/registration-prompt.js';
import { API_URL } from '../config.js';
import { RegistrationPrompt } from '../Types/prompts.js';
import inquirer from 'inquirer';
import loginUser from './login-user-flow.js';
import { tryAgainPrompt } from '../utils.js';

const registerToAPI = async (
    answers: RegistrationPrompt
): Promise<{ status: 'pending' | 'verified' }> => {
    const { username, email, firstName, lastInit, password } = answers;
    const payload = {
        username,
        email,
        firstName,
        lastInit,
        password
    };
    try {
        const { data } = await axios({
            method: 'POST',
            url: `${API_URL}/auth/register`,
            headers: { 'Content-Type': 'application/json' },
            data: payload
        });

        return data;
    } catch (error: any) {
        console.log(error.response.data);
        await inquirer.prompt({
            type: 'input',
            name: 'continue',
            message: 'Press enter to continue'
        });
        throw new Error(
            error.response?.data.message ||
                `An unexpected error occurred\nAPI status response ${error.response.status}`
        );
    }
};

const registerUser = async (): Promise<void> => {
    const answers = await registrationPrompt();
    const registerPayload = {
        username: answers.username.trim(),
        email: answers.email.trim(),
        firstName: answers.firstName.trim(),
        lastInit: answers.lastInit.trim(),
        password: answers.password
    };

    try {
        await registerToAPI(registerPayload);
    } catch (error: any) {
        console.log(chalk.red(error.message));

        const tryAgain = await tryAgainPrompt();

        if (tryAgain) {
            return await registerUser();
        } else {
            return;
        }
    }

    console.log('\nA verification link has been sent to your email');
    console.log(chalk.yellow('Waiting for email verification...'));

    const isUserVerified = await pollVerificationStatus(registerPayload.email);

    if (isUserVerified) {
        console.log(chalk.green('User verified!'));
        await loginUser(registerPayload.email, registerPayload.password);
    }
};

const pollVerificationStatus = async (email: string): Promise<boolean> => {
    const maxAttempts = 300;
    let attempts = 0;

    const checkVerified = async (): Promise<boolean> => {
        try {
            const { data } = await axios.get(
                `${API_URL}/auth/is-verified/?email=${email}`
            );
            return data.status === 'verified';
        } catch (error: any) {
            console.log(chalk.red('Error checking verification status'));
            return false;
        }
    };

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                resolve(false);
            }

            const verified = await checkVerified();
            if (verified) {
                clearInterval(interval);
                resolve(true);
            }

            attempts++;
        }, 5000);
    });
};

export default registerUser;
