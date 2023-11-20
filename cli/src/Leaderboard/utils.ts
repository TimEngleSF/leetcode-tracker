import chalk from 'chalk';

// Display functions
export const displayColors = {
  gold: (str: string | number) => chalk.hex('#FFD700').bold(str),
  silver: (str: string | number) => chalk.hex('#C0C0C0').bold(str),
  bronze: (str: string | number) => chalk.hex('#cd7f32').bold(str),
};

export const changeTextColorByRank = (rank: number, value: string | number) => {
  return rank === 1
    ? displayColors.gold(value)
    : rank === 2
    ? displayColors.silver(value)
    : rank === 3
    ? displayColors.bronze(value)
    : value;
};

export const getDisplayTextForUser = ({
  rank,
  name,
}: {
  rank: number | null;
  name: string;
}) => {
  if (!rank) {
    return `${name}, enter your first attempt for a chance to get on the board!`;
  }
  let userDisplayText = `${name} you rank #${rank}`;

  if (rank === 1) {
    userDisplayText = displayColors.gold(` 🏆 ${userDisplayText} 🏆`);
  } else if (rank === 2) {
    userDisplayText = displayColors.silver(userDisplayText);
  } else if (rank === 3) {
    userDisplayText = displayColors.bronze(userDisplayText);
  }
  return userDisplayText;
};
