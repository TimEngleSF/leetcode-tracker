import axios from 'axios';
import chalk from 'chalk';
import { API_URL } from '../config.js';
import { AnswerDocument } from '../Types/api.js';
import { getAuthHeaders } from '../utils.js';

export const pollAnswerSubmitted = async (
    initialAnswerDocuments: AnswerDocument[],
    currTime: Date
): Promise<boolean> => {
    const maxAttempts = 300;
    let attempts = 0;

    const checkAddedAnswer = async (): Promise<boolean> => {
        try {
            let answerDocuments: AnswerDocument[];
            const { data } = await axios.get(
                `${API_URL}/answers/user-answers`,
                {
                    headers: await getAuthHeaders()
                }
            );
            answerDocuments = data as AnswerDocument[];
            if (initialAnswerDocuments.length === answerDocuments.length) {
                return false;
            }
            const newAnswer = answerDocuments.filter(
                (document) => new Date(document.created) > currTime
            );
            return newAnswer.length > 0 ? true : false;
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

            const answerAdded = await checkAddedAnswer();
            if (answerAdded) {
                clearInterval(interval);
                resolve(true);
            }

            attempts++;
        }, 5000);
    });
};
