import chalk from 'chalk';
import inquirer from 'inquirer';
import { fetchQuestionInfo } from '../../utils.js';
import { QuestionAnswer } from '../../Types/prompts.js';
import { validate, filter } from './validation.js';
// Depricated Prompt... now using add-question-flow
const addQuestionPrompt = async (
    prompt = inquirer.prompt,
    getQuestData = fetchQuestionInfo,
    testing = false
): Promise<QuestionAnswer | null> => {
    try {
        const questNumAnswer: {
            questNum: number;
            diff: number;
            passed: boolean;
            speed: number | null;
        } = await prompt([
            {
                type: 'number',
                name: 'questNum',
                message: 'Please enter a question number',
                filter: filter.questNum,
                validate: validate.questNum
            }
        ]);

        const questData = await getQuestData(questNumAnswer.questNum);
        if (!testing) {
            console.log(
                `\nEntering result for: ${chalk.magenta(
                    questData.title
                )}\nDifficulty: ${
                    questData.diff === 'Easy'
                        ? chalk.green('Easy')
                        : questData.diff === 'Medium'
                        ? chalk.yellow('Medium')
                        : chalk.red('Hard')
                }\n`
            );
        }

        const remainingAnswers = await prompt([
            {
                type: 'list',
                name: 'passed',
                message: 'Did you complete the question?',
                choices: [
                    { name: chalk.green('Passed'), value: true },
                    { name: chalk.red('Failed'), value: false }
                ]
            },
            {
                type: 'list',
                name: 'isAddTimeValid',
                message: 'Would you like to add the runtime speed?',
                when: (answers) => answers.passed,
                choices: [
                    { name: chalk.green('Yes'), value: true },
                    { name: chalk.red('No'), value: false }
                ]
            },
            {
                type: 'number',
                name: 'speed',
                message: 'What was the runtime speed in ms?',
                when: (answers) => answers.isAddTimeValid,
                filter: filter.speed,
                validate: validate.speed
            },
            {
                type: 'list',
                name: 'language',
                message: 'Which language did you use?',
                choices: [
                    { name: 'C++', value: 'C++' },
                    { name: 'Java', value: 'Java' },
                    { name: 'Python', value: 'Python' },
                    { name: 'Python3', value: 'Python3' },
                    { name: 'C', value: 'C' },
                    { name: 'C#', value: 'C#' },
                    { name: 'JavaScript', value: 'JavaScript' },
                    { name: 'TypeScript', value: 'TypeScript' },
                    { name: 'PHP', value: 'PHP' },
                    { name: 'Swift', value: 'Swift' },
                    { name: 'Kotlin', value: 'Kotlin' },
                    { name: 'Dart', value: 'Dart' },
                    { name: 'Go', value: 'Go' },
                    { name: 'Ruby', value: 'Ruby' },
                    { name: 'Scala', value: 'Scala' },
                    { name: 'Rust', value: 'Rust' },
                    { name: 'Racket', value: 'Racket' },
                    { name: 'Erland', value: 'Erlang' },
                    { name: 'Elixer', value: 'Elixer' }
                ]
            }
        ]);

        const answers = {
            ...questNumAnswer,
            ...remainingAnswers
        };

        return answers;
    } catch (error) {
        const shouldRetry = await prompt({
            type: 'confirm',
            name: 'retry',
            message: 'An error occurred. Would you like to retry?'
        });
        if (shouldRetry.retry) {
            return await addQuestionPrompt();
        } else {
            if (!testing) {
                console.error(chalk.red('Operation was not successful.'));
            }
            return null;
        }
    }
};

export default addQuestionPrompt;