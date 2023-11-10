import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/User.js';
import {
  CreateUserInService,
  UserDocument,
  UserRegisterPayload,
} from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';

// const transporter = nodemailer.createTransport({
// service: 'gmail', // or 'SendGrid', 'Outlook', etc.
// auth: {
//   user: process.env.EMAIL_USERNAME,
//   pass: process.env.EMAIL_PASSWORD,
// },

// });

var transport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const registerUserService = async (
  userObj: CreateUserInService
): Promise<{ status: 'pending' }> => {
  const { displayUsername, email, password, firstName, lastInit } = userObj;
  let usernameResult: UserDocument | null;
  let emailResult: UserDocument | null;
  let createUserResult: UserDocument;
  let verificationToken: string;
  try {
    [usernameResult, emailResult] = await Promise.all([
      User.getByUsername(displayUsername),
      User.getByEmail(email.toLowerCase()),
    ]);
  } catch (error) {
    throw error;
  }

  if (usernameResult || emailResult) {
    const error = new ExtendedError('Username or Email already in use.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPass = await bcrypt.hash(password, 12);

  try {
    createUserResult = await User.create({
      displayUsername,
      email,
      hashedPass,
      firstName,
      lastInit,
    });
  } catch (error) {
    throw error;
  }

  if (!process.env.EMAIL_VERIFICATION_SECRET) {
    console.log('Missing EMAIL_VERIFICATION_SECRET');
    const error = new ExtendedError('Internal Service Error');
    error.statusCode = 500;
    throw error;
  }

  try {
    verificationToken = jwt.sign(
      { email: createUserResult.email },
      process.env.EMAIL_VERIFICATION_SECRET,
      { expiresIn: '1h' }
    );
  } catch (error: any) {
    const updatedError = new ExtendedError(
      `Internal Service Error: ${error.message}`
    );
    updatedError.statusCode = 500;
    throw error;
  }

  const verificationUrl = `http://localhost:3000/verify/${verificationToken}`;

  try {
    // "if" is a Typescript issue, always expect _id
    if (createUserResult._id) {
      await User.updateVerificationToken(
        createUserResult._id,
        verificationToken
      );
    }
  } catch (error) {
    throw error;
  }

  const mailOptions = {
    from: 'verify@lctracker.com',
    to: createUserResult.email,
    subject: 'Verify Your Email',
    html: `
      <body style=" display: flex; margin-top: 2rem; background-color: #282828; color: #66ff66; font-family: 'Courier New', Courier, monospace;">
        <div style="display: flex; flex-direction: column; align-items: start; margin: 0 auto; max-width: 500px;">
          <p style="font-size: 32px; margin: 0px 0px;">Hello ${createUserResult.firstName},</p>
          <p style="font-size: 20px; margin: 12px 0px;">Please click the link below to verify your email address:</p>
          <a style="display: inline-block; background-color: #66ff66; margin: 12px 0 ; padding: 20px 10px; text-decoration:none; color: black; font-weight: 600; border-radius: 11px;" href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      </body>`,
  };

  transport.sendMail(mailOptions);

  return {
    status: 'pending',
  };
};

export default registerUserService;
