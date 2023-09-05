import { Request, Response } from 'express-serve-static-core';
import { registerSchema } from '../../db/schemas/auth.js';
import AuthModel from '../../models/Auth/index.js';

export const register = async (req: Request, res: Response) => {
  const { body } = req;
  const { error } = registerSchema.validate(body);
  if (error) {
    res
      .status(400)
      .send({ msg: 'Invalid request data', error: error.details[0].message });
    return;
  }

  try {
    const { code, data } = await AuthModel.registerUser(body);
    res.status(code).send(data);
  } catch (error) {
    res.send({ error: error });
  }
};
