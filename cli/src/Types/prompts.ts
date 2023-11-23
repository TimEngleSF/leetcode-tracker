import inquirer from 'inquirer';

export interface RegistrationPrompt {
    email: string;
    username: string;
    firstName: string;
    lastInit: string;
    password: string;
}

export interface QuestionAnswer {
    questNum: number;
    diff: number;
    passed: boolean;
    speed: number | null;
}

export interface PromptOptions {
    prompt?: typeof inquirer.prompt;
    testing?: boolean;
    errorMessage?: string;
}

export interface AddQuestionFlowInput extends PromptOptions {
    getQuestData: Function;
}

export interface AddTimePrompt extends PromptOptions {
    passed: boolean;
}

export interface SpeedPrompt extends PromptOptions {
    addTime: boolean;
}

export interface addQuestionResult {
    continue: boolean;
    questNum?: number;
}
