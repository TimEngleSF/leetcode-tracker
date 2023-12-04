import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';

import { getAuthHeaders, fetchQuestionInfo, getUserJSON } from '../utils.js';
import { AddQuestionFlowInput, addQuestionResult } from '../Types/prompts.js';
import {
    shouldAddSpeedPrompt,
    passedPrompt,
    questionNumPrompt,
    speedPrompt,
    errorPrompt,
    languagePrompt
} from './Prompts/add-question-prompts.js';
import { API_URL } from '../config.js';

const addQuestion = async ({
    prompt = inquirer.prompt,
    fetchQuestInfo = fetchQuestionInfo,
    testing = false,
    errorMessage = ''
}): Promise<addQuestionResult> => {
    if (errorMessage.length > 0) {
        console.log(chalk.red(errorMessage));
    }
    // Prompt user for question number
    const questNum = await questionNumPrompt({});
    // Get information on that question from API
    const questData = await fetchQuestInfo(questNum);
    // Print question number and title
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
    // Prompt the user
    const isPassed = await passedPrompt({});
    // break flow if user wants to leave
    if (isPassed === 'back') {
        return { continue: false };
    }

    let shouldAddSpeed;
    let speed;
    if (isPassed) {
        shouldAddSpeed = await shouldAddSpeedPrompt({});
        if (shouldAddSpeed === 'back') {
            return { continue: false };
        }
        if (shouldAddSpeed) {
            speed = await speedPrompt({});
        }
    }

    const languageUsed = await languagePrompt();

    // Handle posting question info
    const userInfo = await getUserJSON();
    const payload = {
        userId: userInfo.LC_ID,
        username: userInfo.LC_USERNAME,
        questNum,
        passed: isPassed,
        language: languageUsed,
        speed: speed || null
    };

    // POST user's question result
    try {
        await axios({
            method: 'POST',
            url: `${API_URL}/questions`,
            headers: await getAuthHeaders(),
            data: payload
        });
    } catch (error) {
        // If there was an error notify user and give option to try again
        // TODO: extract response error message and print
        const repeat = await errorPrompt({});
        if (repeat) {
            await addQuestion({});
            return { continue: false };
        }
        return { continue: false };
    }

    return { continue: true, questNum };
};
export default addQuestion;
