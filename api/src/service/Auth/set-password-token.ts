import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/User.js';
import { UserDocument } from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';

const { PASSWORD_VERIFICATION_SECRET } = process.env;

const { BASE_URL } = process.env;

var transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const setPasswordTokenService = async (email: string) => {
  let userDocument: UserDocument | null;
  let token: string;
  try {
    userDocument = await User.getByEmail(email.toLowerCase());
    if (!userDocument) {
      return;
    }
  } catch (error) {
    throw error;
  }

  if (!PASSWORD_VERIFICATION_SECRET) {
    const extendedError = new ExtendedError(
      'Server missing PASSWORD_VERIFICATION_SECRET'
    );
    extendedError.statusCode = 500;
    throw extendedError;
  }

  try {
    token = jwt.sign(
      { email: userDocument.email },
      PASSWORD_VERIFICATION_SECRET,
      {
        expiresIn: '1hr',
      }
    );
  } catch (error: any) {
    const extendedError = new ExtendedError(
      `Error generating token: ${error.message}`
    );
    extendedError.statusCode = 500;
    throw extendedError;
  }

  const passwordResetUrl = `${BASE_URL}/reset/${token}`;

  try {
    await User.updatePasswordToken(userDocument._id, token);
  } catch (error) {
    throw error;
  }

  const mailOptions = {
    from: 'verify@lctracker.com',
    to: userDocument.email,
    subject: 'LC Tracker Password Reset',
    html: `
      <body style=" display: flex; margin-top: 2rem; background-color: #282828; color: #66ff66; font-family: 'Courier New', Courier, monospace;">
        <div style="display: flex; flex-direction: column; align-items: start; margin: 0 auto; max-width: 500px;">
          <p style="font-size: 32px; margin: 0px 0px;">Hello ${userDocument.firstName},</p>
          <p style="font-size: 20px; margin: 12px 0px;">Please click the link below to reset your password:</p>
          <a style="display: inline-block; background-color: #66ff66; margin: 12px 0 ; padding: 20px 10px; text-decoration:none; color: black; font-weight: 600; border-radius: 11px;" href="${passwordResetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      </body>`,
  };

  transport.sendMail(mailOptions);
};
export default setPasswordTokenService;
