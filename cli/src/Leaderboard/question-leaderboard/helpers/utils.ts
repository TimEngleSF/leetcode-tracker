import chalk from 'chalk';
import Table from 'cli-table3';

export const initQuestTable = () => {
    return new Table({
        head: [
            chalk.white('Rank'),
            chalk.white('User'),
            chalk.white('Passed'),
            chalk.white('Speed'),
            chalk.white('Language'),
            chalk.white('Most Recent')
        ],
        colWidths: [8, 15, 10, 10, 15, 16]
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
