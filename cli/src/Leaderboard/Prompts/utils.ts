import chalk from 'chalk';

export const validate = {
  questNum: (number: number, testing = false) => {
    if (testing) {
      return (
        (number > 0 && number < 2400) ||
        chalk.red('\nQuestion number must be between 0 and 2400')
      );
    } else {
      return (
        (number > 0 && number < 2400) ||
        console.log(chalk.red('\nQuestion number must be between 0 and 2400'))
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
};
