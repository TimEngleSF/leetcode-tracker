import chalk from 'chalk';
import Table from 'cli-table3';

export const initQuestTable = () => {
  return new Table({
    head: [
      chalk.white('Rank'),
      chalk.white('User'),
      chalk.white('Times Passed'),
      chalk.white('Speed'),
      chalk.white('Most Recent Pass'),
    ],
    colWidths: [8, 10, 15, 8],
  });
};

interface DataRow {
  _id: string;
  firstName: string;
  lastInit: string;
  passedCount: number;
  minSpeed?: number;
  mostRecent: Date;
}
export const sortLeaderboardData = (
  data: DataRow[],
  sortingSelection: string
) => {
  if (sortingSelection === 'minSpeed') {
    return data.sort((a, b) => {
      if (a.minSpeed && b.minSpeed) {
        return a.minSpeed - b.minSpeed;
      } else {
        return 0;
      }
    });
  } else {
    return data.sort((a, b) => b.passedCount - a.passedCount);
  }
};
