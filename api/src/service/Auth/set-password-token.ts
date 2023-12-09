import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { UserDocument } from '../../types/userTypes';
import { ExtendedError } from '../../errors/helpers';
import { transporter, senderEmail } from './nodemailer-transport';

const { PASSWORD_VERIFICATION_SECRET } = process.env;

const { BASE_URL } = process.env;

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
                expiresIn: '1hr'
            }
        );
    } catch (error: any) {
        const extendedError = new ExtendedError(
            `Error generating token: ${error.message}`
        );
        extendedError.statusCode = 500;
        throw extendedError;
    }

    const passwordResetUrl = `${BASE_URL}/auth/reset/${token}`;

    try {
        await User.updatePasswordToken(userDocument._id, token);
    } catch (error) {
        throw error;
    }

    const mailOptions = {
        from: senderEmail,
        to: userDocument.email,
        subject: 'LC Tracker Password Reset',
        html: `
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding-top: 2rem; background-color: #282828; color: #66ff66; font-family: 'Courier New', Courier, monospace;">
            <table width="500px">
              <tr>
                <td style="font-size: 32px;">Hello ${userDocument.firstName},</td>
              </tr>
              <tr>
                <td style="font-size: 20px;">Please click the link below to reset your password:</td>
              </tr>
              <tr>
                <td align="center">
                  <a href="${passwordResetUrl}" style="display: inline-block; background-color: #66ff66; color: black; padding: 15px 30px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 10px;">This link will expire in 1 hour.</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    };

    transporter.sendMail(mailOptions);
};
export default setPasswordTokenService;
