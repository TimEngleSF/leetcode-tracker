import chalk from 'chalk';

export const validate = {
    passCode: (input: string) => {
        return input.length === 6 && /^[a-zA-Z0-9]*$/.test(input)
            ? true
            : 'Passcode should be 6 alphanumeric characters long';
    }
};

export const filter = {
    passCode: (input: string) => {
        if (input.length !== 6 && typeof input !== 'string') {
            return '';
        } else return input;
    }
};
