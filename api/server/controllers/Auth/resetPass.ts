import { Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import AuthModel from '../../models/Auth/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

export const resetPass = async (req: Request, res: Response) => {
  const { body } = req;
  const { username, password } = req.body;
  const expectedBody = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    token: Joi.string().required(),
  });
  const { error } = expectedBody.validate(body);
  if (error) {
    res
      .status(400)
      .send({ msg: 'Invalid request data', error: error.details[0].message });
    return;
  }
  try {
    const decodedToken = jwt.verify(body.token, JWT_SECRET) as {
      username: string;
    };
    if (decodedToken.username !== body.username) {
      res
        .status(403)
        .send(
          'Username signed to token does not match username that is being requested'
        );
      return;
    }
    const { code, data } = await AuthModel.resetPass(username, password);
    res.status(code).send(data);
  } catch (error) {
    res.status(400).send('There was an error processing request');
  }
};
