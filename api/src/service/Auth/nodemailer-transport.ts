import nodemailer, { Transport, Transporter } from 'nodemailer';

// development transporter
export let transporter: Transporter;
export let senderEmail: string;

export const setNodemailerTransport = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Production mode');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    senderEmail = 'lc.tracker.auth@gmail.com';
  } else {
    transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
    senderEmail = 'testing@email.com';
  }
};
