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
        chalk.red('\nNumber must be between 0 and 10000\nOr no input')
      );
    } else {
      return (
        (number > 0 && number < 10000) ||
        console.log(
          chalk.red('\nNumber must be between 0 and 10000\nOr no input')
        )
      );
    }
  },
};
