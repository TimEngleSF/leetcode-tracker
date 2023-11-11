import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getSecurityAnswers } from '../../db/collections.js';

const secAnsCollection = await getSecurityAnswers();

interface AuthModelResponse {
  code: number;
  data?: { error: string; message: string } | { token?: string };
}

export const validateSecAnswer = async (body: {
  username: string;
  yob: string;
  color: string | null;
  street: string | null;
}): Promise<AuthModelResponse> => {
  const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
  try {
    const { username, yob, color, street } = body;
    const securityData = await secAnsCollection.findOne({
      username: username.toLowerCase(),
    });

    if (!securityData) {
      return {
        code: 404,
        data: { error: 'username', message: 'No corresponding username' },
      };
    }

    const isValidYOB = await bcrypt.compare(yob, securityData.answers.yob);

    if (!isValidYOB) {
      return {
        code: 400,
        data: { error: 'yob', message: 'Incorrect year of birth' },
      };
    }

    if (color) {
      const isValidColor = await bcrypt.compare(
        color.toLowerCase(),
        securityData.answers.color
      );
      if (!isValidColor) {
        return {
          code: 400,
          data: { error: 'color', message: 'Incorrect color' },
        };
      }
    }

    if (street) {
      const isValidStreet = await bcrypt.compare(
        street.toLowerCase(),
        securityData.answers.street
      );
      if (!isValidStreet) {
        return {
          code: 400,
          data: { error: 'street', message: 'Incorrect street' },
        };
      }
    }

    if (!color && !street) {
      return {
        code: 400,
        data: {
          error: 'inputs',
          message: 'Neither a color or street were included in request',
        },
      };
    }
    let token: string | undefined;
    if (typeof JWT_SECRET === 'string') {
      token = jwt.sign({ username }, JWT_SECRET, { expiresIn: 60 * 5 });
    }
    return {
      code: 201,
      data: { token },
    };
  } catch (error: any) {
    return {
      code: 400,
      data: { message: 'There was an error processing request', error },
    };
  }
};
