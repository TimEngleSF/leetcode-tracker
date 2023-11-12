import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/User.js';
import { CreateUserInService, UserDocument } from '../../types/userTypes.js';
import { ExtendedError } from '../../errors/helpers.js';
import Blacklist from '../../models/Blacklist.js';

// const transporter = nodemailer.createTransport({
// service: 'gmail', // or 'SendGrid', 'Outlook', etc.
// auth: {
//   user: process.env.EMAIL_USERNAME,
//   pass: process.env.EMAIL_PASSWORD,
// },

// });

const { BASE_URL } = process.env;

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

  if (
    (usernameResult && usernameResult.status === 'verified') ||
    (emailResult && emailResult.status === 'verified')
  ) {
    const error = new ExtendedError('Username or Email already in use.');
    error.statusCode = 400;
    throw error;
  } else if (usernameResult && usernameResult.status === 'pending') {
    try {
      if (usernameResult._id) {
        await Promise.all([
          User.deleteById(usernameResult?._id),
          Blacklist.addBlacklistToken(
            usernameResult.verificationToken,
            'EMAIL_VERIFICATION_SECRET'
          ),
        ]);
      }
    } catch (error: any) {
      throw error;
    }
  } else if (emailResult && emailResult.status === 'pending') {
    try {
      if (emailResult._id) {
        await Promise.all([
          User.deleteById(emailResult?._id),
          Blacklist.addBlacklistToken(
            emailResult.verificationToken,
            'EMAIL_VERIFICATION_SECRET'
          ),
        ]);
      }
    } catch (error) {
      throw error;
    }
  }

  if (!process.env.EMAIL_VERIFICATION_SECRET) {
    const error = new ExtendedError(
      'Internal Service Error: Missing EMAIL_VERIFICATION_SECRET'
    );
    error.statusCode = 500;
    throw error;
  }

  try {
    verificationToken = jwt.sign(
      { username: displayUsername.toLowerCase(), email: email.toLowerCase() },
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

  const hashedPass = await bcrypt.hash(password, 12);

  try {
    createUserResult = await User.create({
      displayUsername,
      email,
      hashedPass,
      firstName,
      lastInit,
      verificationToken,
    });
  } catch (error) {
    throw error;
  }

  const verificationUrl = `${BASE_URL}/verify/${verificationToken}`;

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
