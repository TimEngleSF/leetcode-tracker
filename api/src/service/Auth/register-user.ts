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
    html: `<p>Hi ${createUserResult.firstName},</p>
             <p>Please click the link below to verify your email address:</p>
             <a href="${verificationUrl}">Verify Email</a>
             <p>This link will expire in 1 hour.</p>`,
  };

  transport.sendMail(mailOptions);

  return {
    status: 'pending',
  };
};

export default registerUserService;
