import 'dotenv/config';
import fs from 'fs/promises';

const LC_TOKEN = process.env.LC_TOKEN;

export const authHeaders = { Authorization: `Bearer ${LC_TOKEN}` };

export const checkForEnv = async () => {
  let envExists;

  try {
    await fs.access(new URL('.env', import.meta.url));
    envExists = true;
  } catch (error) {
    envExists = false;
  }

  if (!envExists) {
    await fs.writeFile(new URL('./.env', import.meta.url), '');
  }
};
