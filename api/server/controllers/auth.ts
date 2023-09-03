import { Request, Response } from 'express-serve-static-core';

const Auth = {
  login: async (req: Request, res: Response) => {
    console.log(req.body);
    res.send('Hello');
  },
  register: async (req: Request, res: Response) => {
    console.log(req.body);
    res.send('Register');
  },
  resetPass: async (req: Request, res: Response) => {
    console.log(req.body);
    res.send('Reset Password');
  },
};

export default Auth;
