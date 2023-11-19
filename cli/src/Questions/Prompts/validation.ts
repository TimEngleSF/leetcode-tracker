import chalk from 'chalk';

export const validate = {
  questNum: async (number: number, testing = false) => {
    if (testing) {
      return (
        (number <= 2400 && number >= 1) ||
        chalk.red('\nNumber should be from 1 to 2400')
      );
    } else {
      return (
        (number <= 2400 && number >= 1) ||
        console.log(chalk.red('\nNumber should be from 1 to 2400'))
      );
    }
  },

  speed: async (number: number, testing = false) => {
    if (testing) {
      return (
        (number > 0 && number < 10000) ||
        chalk.red('\nNumber must be between 0 and 10000')
      );
    } else {
      return (
        (number > 0 && number < 10000) ||
        console.log(chalk.red('\nNumber must be between 0 and 10000'))
      );
    }
  },
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
  },
};
