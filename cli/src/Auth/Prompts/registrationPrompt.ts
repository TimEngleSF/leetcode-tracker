import inquirer from 'inquirer';
import chalk from 'chalk';
import {
    emailSchema,
    usernameFirstNameSchema,
    lastInitSchema,
    passwordSchema
} from './validation/validationSchema.js';
import { RegistrationPrompt } from '../../Types/prompts.js';

const emailPrompt = async (): Promise<string> => {
    const emailAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'email',
            message: 'Enter an email: ',
            validate: (input) => {
                const { error } = emailSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        },
        {
            type: 'input',
            name: 'emailConfirm',
            message: 'Confirm your email: ',
            validate: (input) => {
                const { error } = emailSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        }
    ]);

    if (emailAnswers.email !== emailAnswers.emailConfirm) {
        console.log(chalk.red('Emails did not match. Please try again.'));
        return await emailPrompt();
    }

    return emailAnswers.email;
};

const passwordPrompt = async (): Promise<{ password: string } | null> => {
    const passwordAnswers = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Please choose a simple password: ',
            validate: (input) => {
                const { error } = passwordSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        },
        {
            type: 'password',
            name: 'passwordCheck',
            message: 'Please re-enter your password: '
        }
    ]);

    if (passwordAnswers.password !== passwordAnswers.passwordCheck) {
        console.log(chalk.red('Passwords did not match. Please try again.'));
        return await passwordPrompt();
    }

    return passwordAnswers.password;
};

const registrationPrompt = async (): Promise<RegistrationPrompt> => {
    const email = await emailPrompt();
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter a username: ',
            validate: (input) => {
                const { error } = usernameFirstNameSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        },
        {
            type: 'input',
            name: 'firstName',
            message: "What's your first name? ",
            validate: (input) => {
                const { error } = usernameFirstNameSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        },
        {
            type: 'input',
            name: 'lastInit',
            message: "What's your last initial? ",
            validate: (input) => {
                const { error } = lastInitSchema.validate(input);
                return error ? chalk.red(error.message) : true;
            }
        }
    ]);

    const passwordAnswer = await passwordPrompt();
    return { email, ...answers, password: passwordAnswer };
};

export default registrationPrompt;
