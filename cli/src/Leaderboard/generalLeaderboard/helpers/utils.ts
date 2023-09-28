import Table from 'cli-table3';
import chalk from 'chalk';
export const initGeneralTable = () => {
  return new Table({
    head: [
      chalk.white('Rank'),
      chalk.white('User'),
      chalk.white('Passed'),
      chalk.white('Last Active'),
    ],
    colWidths: [8, 10, 8, 15],
  });
};
