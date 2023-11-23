import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';

import { getAuthHeaders, getQuestionData, getUserJSON } from '../utils.js';
import { AddQuestionFlowInput, addQuestionResult } from '../Types/prompts.js';
import {
    shouldAddSpeedPrompt,
    passedPrompt,
    questionNumPrompt,
    speedPrompt,
    errorPrompt
} from './Prompts/question-num-prompt.js';
import { API_URL } from '../config.js';

const addQuestion = async ({
    prompt = inquirer.prompt,
    getQuestData = getQuestionData,
    testing = false,
    errorMessage = ''
}): Promise<addQuestionResult> => {
    if (errorMessage.length > 0) {
        console.log(chalk.red(errorMessage));
    }
    const questNum = await questionNumPrompt({});

    const questData = await getQuestData(questNum);
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

    const passed = await passedPrompt({});

    if (passed === 'back') {
        return { continue: false };
    }

    let shouldAddSpeed;
    let speed;
    if (passed) {
        shouldAddSpeed = await shouldAddSpeedPrompt({});
        if (shouldAddSpeed === 'back') {
            return { continue: false };
        }
        if (shouldAddSpeed) {
            speed = await speedPrompt({});
        }
    }

    // Handle posting question info
    const userInfo = await getUserJSON();
    const payload = {
        userId: userInfo.LC_ID,
        username: userInfo.LC_USERNAME,
        questNum,
        passed,
        speed: speed || null
    };

    try {
        await axios({
            method: 'POST',
            url: `${API_URL}/questions/add`,
            headers: await getAuthHeaders(),
            data: payload
        });
    } catch (error) {
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
