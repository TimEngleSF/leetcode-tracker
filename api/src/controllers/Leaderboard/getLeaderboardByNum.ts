import { Request, Response } from 'express';
import LeaderModel from '../../models/Leaderboard/index.js';
// import writeErrorToFile from '../../errors/writeError.js';

export const getLeaderboardByNum = async (req: Request, res: Response) => {
  const { questId } = req.params;
  try {
    const { code, data } = await LeaderModel.getLeaderboardByNum(questId);
    // res.status(code).send(data);
    res.status(code).send(data);
  } catch (error: any) {
    // await writeErrorToFile(
    //   error,
    //   'Error arrised when executing getGeneralLeaderBoard controller'
    // );
    res.send(error);
  }
};
