import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import open from 'open';

import {
    UserQuestionInfo,
    addAnswerCodePrompt,
    addQuestionToDatabasePrompt,
    isReadyToSubmitPrompt,
    openQuestionInBrowserPrompt,
    userQuestionInfoPrompt,
    viewSubmissionsPrompt
} from './Prompts/featured-question-prompts.js';
import { getAuthHeaders, printHeader } from '../utils.js';
import { UserObject } from '../Types/user.js';
import { AnswerDocument, QuestionDocument } from '../Types/api.js';
import { API_URL } from '../config.js';
import { pollAnswerSubmitted } from './helpers.js';

const featuredQuestionAddAnswerFlow = async ({
    questNum,
    questionInfoUrl,
    questionDisplayText,
    userData,
    groupId
}: {
    questNum: number;
    questionInfoUrl: string;
    questionDisplayText: string;
    userData: UserObject;
    groupId: string;
}): Promise<QuestionDocument | void> => {
    const userWantsToOpen = await openQuestionInBrowserPrompt();

    if (userWantsToOpen) {
        open(questionInfoUrl);
    } else {
        return;
    }

    console.clear();
    printHeader();
    console.log(questionDisplayText);

    const addQuestionToDb = await addQuestionToDatabasePrompt();

    if (!addQuestionToDb) {
        return;
    }

    const userQuestionInfoFlow = async (): Promise<UserQuestionInfo> => {
        let userQuestionInfo: UserQuestionInfo;

        userQuestionInfo = await userQuestionInfoPrompt();

        console.clear();
        printHeader();
        console.log(questionDisplayText);
        console.log(
            `Passed: ${userQuestionInfo.isPassed}\nSpeed: ${
                userQuestionInfo.speed ? userQuestionInfo.speed : 'N/A'
            }\nLanguage: ${userQuestionInfo.language}\n`
        );

        const isReadyToSubmit = await isReadyToSubmitPrompt();

        if (!isReadyToSubmit) {
            userQuestionInfo = await userQuestionInfoFlow();
        }

        return userQuestionInfo;
    };

    const userQuestionInfo = await userQuestionInfoFlow();

    const payload = {
        userId: userData.LC_ID,
        username: userData.LC_USERNAME,
        questNum,
        passed: userQuestionInfo.isPassed,
        language: userQuestionInfo.language,
        speed: userQuestionInfo.speed || null
    };

    let postedQuestionDocument: QuestionDocument;

    try {
        const { data } = await axios({
            method: 'POST',
            url: `${API_URL}/questions`,
            headers: await getAuthHeaders(),
            data: payload
        });

        postedQuestionDocument = data as QuestionDocument;
    } catch (error) {
        const { repeat } = await inquirer.prompt({
            type: 'confirm',
            name: 'repeat',
            message: chalk.red(
                'There was an error adding your information to the database, would you like to try another featured question?'
            )
        });
        if (repeat) {
            return;
        }
        return;
    }

    console.log(chalk.green('Your results have been submitted!'));

    const addAnswer = await addAnswerCodePrompt();

    if (addAnswer) {
        open(`${API_URL}/answers/form/${postedQuestionDocument._id}`);
        let initialAnswerDocuments: AnswerDocument[];
        const { data } = await axios.get(`${API_URL}/answers/user-answers`, {
            headers: await getAuthHeaders()
        });

        initialAnswerDocuments = data as AnswerDocument[];
        const currTime = new Date();
        console.log(chalk.yellow('Waiting for code submission...'));

        const isAnswerUploaded = await pollAnswerSubmitted(
            initialAnswerDocuments,
            currTime
        );

        if (isAnswerUploaded) {
            console.clear();
            printHeader();
            console.log(chalk.green('Your code has been added!'));
            const viewSubmissions = await viewSubmissionsPrompt();
            if (viewSubmissions) {
                open(`${API_URL}/answers/group/${groupId}`);
            }
        }
    }
};

export default featuredQuestionAddAnswerFlow;
