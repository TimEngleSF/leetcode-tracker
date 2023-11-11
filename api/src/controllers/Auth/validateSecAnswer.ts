import { Request, Response } from 'express-serve-static-core';
import AuthModel from '../../models/Auth/index.js';
import { authReqSchemas } from './authReqSchemas.js'; // import writeErrorToFile from '../../errors/writeError.js';

export const validateSecAnswer = async (req: Request, res: Response) => {
  const { body } = req;

  const { error } = authReqSchemas.validateSecAnswer.validate(body);
  if (error) {
    res
      .status(400)
      .send({ msg: 'Invalid request data', error: error.details[0].message });
    return;
  }
  try {
    const { code, data } = await AuthModel.validateSecAnswer(body);
    if (data) {
      res.status(code).send(data);
    } else {
      res.status(code).end();
    }
  } catch (error) {
    // await writeErrorToFile(error);
    res.send({ error: error });
  }
};
