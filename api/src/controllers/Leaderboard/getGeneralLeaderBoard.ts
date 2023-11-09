import { Request, Response } from 'express';
import LeaderModel from '../../models/Leaderboard/index.js';
// import writeErrorToFile from '../../errors/writeError.js';

export const getGeneralLeaderBoard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { code, data } = await LeaderModel.getGeneralLeaderBoard(userId);
    res.status(code).send(data);
  } catch (error: any) {
    res.status(400).send(error);
  }
};
