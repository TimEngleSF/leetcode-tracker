import { Request, Response } from 'express-serve-static-core';

const Questions = {
  // GET
  getQuestionDataForUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    res.send(`You are looking for your data on question ${id}`);
  },

  getAllQuestionsDataForUser: async (req: Request, res: Response) => {
    res.send(`You are looking for data on all of your questions`);
  },

  getReviewQuestions: async (req: Request, res: Response) => {
    res.send(
      'You are looking for questions to review, here is the url to it as well'
    );
  },

  // POST
  addQuestionData: async (req: Request, res: Response) => {
    res.send(
      `Question ID: ${req.body.id}\nPassed: ${req.body.passed}\nTime: ${req.body.time}\nSpace: ${req.body.space}`
    );
  },
};

export default Questions;
