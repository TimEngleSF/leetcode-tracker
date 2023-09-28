import chalk from 'chalk';

// Display functions
export const displayColors = {
  gold: (str: string | number) => chalk.hex('#FFD700').bold(str),
  silver: (str: string | number) => chalk.hex('#C0C0C0').bold(str),
  bronze: (str: string | number) => chalk.hex('#cd7f32').bold(str),
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
