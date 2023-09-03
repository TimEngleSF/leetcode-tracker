import { Request, Response } from 'express-serve-static-core';
import { registerSchema } from '../db/schemas/auth.js';
import registerUser from '../models/Auth/registerUser.js';

const Auth = {
  login: async (req: Request, res: Response) => {
    console.log(req.body);
    res.send('Hello');
  },

  register: async (req: Request, res: Response) => {
    const { body } = req;
    const { error } = registerSchema.validate(body);
    if (error) {
      res
        .status(400)
        .send({ msg: 'Invalid request data', error: error.details[0].message });
      return;
    }

    try {
      const { code, data } = await registerUser(body);
      res.status(code).send(data);
    } catch (error) {}
  },

  resetPass: async (req: Request, res: Response) => {
    console.log(req.body);
    res.send('Reset Password');
  },
};

export default Auth;
