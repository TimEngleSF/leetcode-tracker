import chalk from 'chalk';

export const validate = {
    questNum: async (number: number) => {
        return number <= 2400 && number >= 1
            ? true
            : chalk.red('\nNumber should be from 1 to 2400');
    },

    speed: async (number: number) => {
        return number > 0 && number < 10000
            ? true
            : chalk.red('\nNumber must be between 0 and 10000');
    }
};

export const filter = {
    questNum: (input: string) => {
        const int = Number.parseInt(input, 10);
        if (isNaN(int) || int < 1 || int > 2400) {
            return '';
        } else return int;
    },
    speed: (input: string) => {
        const int = Number.parseInt(input, 10);
        if (isNaN(int) || int < 1 || int > 10000) {
            return '';
        } else return int;
    }
};
