import chalk from 'chalk';
import Table from 'cli-table3';
import { getUserData } from '../utils.js';

export const displayColors = {
  gold: (str: string | number) => chalk.hex('#FFD700').bold(str),
  silver: (str: string | number) => chalk.hex('#C0C0C0').bold(str),
  bronze: (str: string | number) => chalk.hex('#cd7f32').bold(str),
};

export const createRowData = async (leaderData: { data: [] }) =>
  await Promise.all(
    leaderData.data.map(
      async (userQuestData: {
        _id: string;
        passedCount: number;
        minSpeed: number;
        mostRecent: number;
      }) => {
        const data = await getUserData(userQuestData._id);

        return {
          userID: userQuestData._id,
          firstName: data.firstName,
          lastInit: data.lastInit,
          passedCount: userQuestData.passedCount,
          minSpeed: userQuestData.minSpeed,
          mostRecent: userQuestData.mostRecent,
        };
      }
    )
  );
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

export const formatRank = (i: number) => {
  return i === 0
    ? displayColors.gold(i + 1)
    : i === 1
    ? displayColors.silver(i + 1)
    : i === 2
    ? displayColors.bronze(i + 1)
    : i + 1;
};

export const getDisplayTextForUser = (userDisplayData: {
  rank?: number;
  name?: string;
}) => {
  let userDisplayText = `${userDisplayData.name} you rank #${userDisplayData.rank}`;
  if (userDisplayData.rank === 1) {
    userDisplayText = displayColors.gold(userDisplayText);
  } else if (userDisplayData.rank === 2) {
    userDisplayText = displayColors.silver(userDisplayText);
  } else if (userDisplayData.rank === 3) {
    userDisplayText = displayColors.bronze(userDisplayText);
  }
  return userDisplayText;
};
