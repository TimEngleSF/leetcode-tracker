import axios from 'axios';
import Table from 'cli-table3';
import writeErrorToFile from '../errors/writeError.js';
import { getAuthHeaders } from '../utils.js';
import { format, differenceInDays } from 'date-fns';

export const generalLeaderboard: any = async () => {
  try {
    const authHeader = await getAuthHeaders();
    const leaderData = await axios({
      method: 'GET',
      url: 'http://localhost:3000/leaderboard',
      headers: { ...authHeader },
    });

    const getUserData = async (userID: string) =>
      await axios({
        method: 'GET',
        url: `http://localhost:3000/users/${userID}`,
        headers: { ...authHeader },
      });

    const sortedLeaderData = leaderData.data.sort(
      (a: any, b: any) => b.passedCount - a.passedCount
    );

    const completeLeaderData = await Promise.all(
      sortedLeaderData.map(
        async (leaderData: { _id: string; passedCount: number }) => {
          const { data } = await getUserData(leaderData._id);
          const lastActivity = differenceInDays(
            new Date(),
            new Date(data.lastActivity)
          );
          return {
            name: `${data.firstName} ${data.lastInit}`,
            passed: leaderData.passedCount,
            lastActive:
              lastActivity === 0 ? 'Today' : `${lastActivity} days ago`,
          };
        }
      )
    );

    console.table(completeLeaderData);

    // const table = new Table({
    //   head: User,
    // });

    // console.log('hello', leaderData.data);
  } catch (error: any) {
    console.log(error);
    await writeErrorToFile(
      error,
      'Error arrised while executing generalLeaderBoard function'
    );
  }
};

// await generalLeaderboard();
