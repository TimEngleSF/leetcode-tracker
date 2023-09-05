import 'dotenv/config';
import fs from 'fs/promises';

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
